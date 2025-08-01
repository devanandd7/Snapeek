import axios from 'axios';

// Helper to fetch an image from a URL and return base64 (no data:... prefix)
async function fetchImageAsBase64(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary').toString('base64');
}

export async function analyzeImageWithGemini(imageUrl) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env.local');

  // Fetch the image and convert to base64
  const base64Image = await fetchImageAsBase64(imageUrl);

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Analyze this image and respond ONLY with a JSON object in this format:
{
  "category": "<one word category, e.g. coding, study, movies, food, nature, etc.>",
  "description": "<detailed description of the image with structured formate ,if image is not study related than give compliment and suggestion for look and style and hindi sayari , and if other than only describe the image in detail>",
}
Do not include any other text.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  let responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let category = 'uncategorized';
  let description = 'No AI description available';

  // Remove triple backticks and optional "json" label
  responseText = responseText.trim();
  if (responseText.startsWith('```json')) {
    responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(responseText);
    if (parsed.category) category = parsed.category.toLowerCase();
    if (parsed.description) description = parsed.description;
  } catch (e) {
    console.error('Failed to parse Gemini response as JSON:', responseText);
  }
  return { description, category, rawResponse: responseText };
}


// --- Fixed Study Notes Prompt ---
const STUDY_NOTES_PROMPT_TEMPLATE = `

Your task is to act as an expert educator and a patient teacher. Analyze the provided image deeply and generate comprehensive, detailed study notes that clarify concepts thoroughly like IEEE standards research.

For each subject or topic, explain it as you would to a student who is seeing it for the first time and  try to explain with the image , find the relevent image online and provide the URL of image that give clear understandin of this each topic that mension it image .
 When appropriate, include Mermaid diagrams to visualize concepts.
and  Recap of Previous Topics (from the root topic to the current one), so learners understand the connection and don't get lost. Mention types and subtypes if they were part of previous content.
Follow this format strictly:

1. A clear **title** for the entire note at the top, wrapped in double asterisks.
2. Use section headings with double hashes (##) for topics, e.g., '## Key Concepts'.
3. Use horizontal lines (---) to separate major sections and create visual partitions.
4. Use color coding with HTML spans for better readability:
   - <span style="color: #dc2626; font-weight: bold;">Important concepts, warnings, or critical points</span>
   - <span style="color: #059669; font-weight: bold;">Definitions, key terms, or positive outcomes</span>
   - <span style="color: #d97706; font-weight: bold;">Examples, tips, or noteworthy information</span>
5. Use standard markdown bullet points for lists or key takeaways.
6. Where formulas are needed, wrap them like this: [FORMULA: E = mc^2]. This is critical for rendering them correctly.
7. For diagrams, use Mermaid syntax wrapped in code blocks like this:
   \`\`\`mermaid
   graph TD;
   A --> B;
   \`\`\`
8. Keep paragraphs concise and the layout clean. Avoid overly nested bullet points.
9. If relevant, include a section titled '## Tools and Libraries' and list relevant tools.

Your entire response must be a single string inside the 'noteContent' field of the JSON output. The response must be layout-safe and component-friendly.

Respond ONLY with a valid JSON array of objects, where each object has a 'subject' (string) and a 'noteContent' (string). Do not include any other text or markdown formatting outside of the JSON.

If there is only one subject, return an array with a single object.

Example response format:
[{"subject": "Mathematics", "noteContent": "**Linear Equations**\\n\\n---\\n\\n## Key Concepts\\n\\n- <span style=\"color: #059669; font-weight: bold;\">Linear equation</span>: A mathematical equation that represents a straight line\\n- <span style=\"color: #dc2626; font-weight: bold;\">General form</span>: y = mx + b\\n- <span style=\"color: #d97706; font-weight: bold;\">Example</span>: y = 2x + 3 (slope = 2, y-intercept = 3)\\n\\n\`\`\`mermaid\\ngraph LR;\\nA[Input x] --> B[multiply by m];\\nB --> C[add b];\\nC --> D[Output y];\\n\`\`\`\\n\\n---\\n\\n## Applications\\n\\n- <span style=\"color: #059669; font-weight: bold;\">Physics</span>: Used for motion equations\\n- <span style=\"color: #059669; font-weight: bold;\">Economics</span>: Cost analysis and profit calculations"}]
`;


export async function generateStudyNotes(imageUrl, existingDescription) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in .env.local');
    throw new Error('GEMINI_API_KEY not set in .env.local');
  }

  console.log('Starting study notes generation for:', imageUrl);
  console.log('Existing description:', existingDescription);

  try {
    // Fetch the image and convert to base64
    const base64Image = await fetchImageAsBase64(imageUrl);
    console.log('Image converted to base64, length:', base64Image.length);

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this image and create comprehensive study notes. ${existingDescription ? `Context: ${existingDescription}` : ''}\n\n${STUDY_NOTES_PROMPT_TEMPLATE}`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    console.log('Sending request to Gemini API...');
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('Gemini API response received:', JSON.stringify(data, null, 2));

    let responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    console.log('Raw response text:', responseText);

    // Clean up the response to ensure it is valid JSON
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    console.log('Cleaned response text:', responseText);

    try {
      const notesArray = JSON.parse(responseText);
      console.log('Parsed notes array:', notesArray);
      
      if (Array.isArray(notesArray) && notesArray.length > 0) {
        console.log('Successfully generated', notesArray.length, 'study notes');
        return notesArray;
      } else {
        console.warn('Notes array is empty or invalid');
        return [];
      }
    } catch (parseError) {
      console.error('Failed to parse study notes as JSON:', parseError);
      console.error('Response text was:', responseText);
      
      // Try to create a fallback note from the raw response
      if (responseText && responseText.length > 10) {
        console.log('Creating fallback note from raw response');
        return [{
          subject: 'Study Notes',
          noteContent: `**Generated Study Notes**\n\n${responseText}`
        }];
      }
      
      return []; // Return empty array on failure
    }
  } catch (error) {
    console.error('Error in generateStudyNotes:', error);
    throw error;
  }
}