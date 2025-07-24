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
  "description": "<detailed description of the image>"
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


// --- Refactored Study Notes Prompt ---
const STUDY_NOTES_PROMPT_TEMPLATE = `
Your task is to generate structured technical or academic notes designed for PDF export. When responding, follow this format strictly:

1. A clear **title** for the entire note at the top, wrapped in double asterisks.
2. Use section headings with double hashes (##) for topics, e.g., '## Key Concepts'.
3. Use standard markdown bullet points for lists or key takeaways.
4. Where formulas are needed, wrap them like this: [FORMULA: E = mc^2]. This is critical for rendering them correctly as images.
5. Keep paragraphs concise and the layout clean. Avoid overly nested bullet points.
6. If relevant, include a section titled '## Tools and Libraries' and list tools like 'react-pdf'.

Your entire response must be a single string inside the 'noteContent' field of the JSON output. The response must be layout-safe and component-friendly.

Respond ONLY with a valid JSON array of objects, where each object has a 'subject' (string) and a 'noteContent' (string). Do not include any other text or markdown formatting outside of the JSON.

If there is only one subject, return an array with a single object.
`;


export async function generateStudyNotes(imageUrl, existingDescription) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env.local');

  // Fetch the image and convert to base64
  const base64Image = await fetchImageAsBase64(imageUrl);

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

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  let responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

  // Clean up the response to ensure it is valid JSON
  responseText = responseText.trim();
  if (responseText.startsWith('```json')) {
    responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    const notesArray = JSON.parse(responseText);
    return Array.isArray(notesArray) ? notesArray : [];
  } catch (e) {
    console.error('Failed to parse study notes as JSON:', responseText);
    return []; // Return empty array on failure
  }
}