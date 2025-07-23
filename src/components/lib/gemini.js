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
            text: `Analyze this image and create comprehensive study notes. ${existingDescription ? `Context: ${existingDescription}` : ''}

Your task is to act as an expert educator. Analyze the provided image and generate a structured JSON array of study notes. Each object in the array should represent a distinct subject or topic found in the image.

For each subject, provide detailed notes. Where a set of concepts can be visualized, generate a Mermaid 'graph TD' concept map and embed it directly within the notes using the following format:

<MERMAID>
graph TD
    A[Concept 1] --> B[Concept 2]
    A --> C[Concept 3]
</MERMAID>

Respond ONLY with a valid JSON array in the following format. Do not include any other text or markdown formatting.

[
  {
    "subject": "<Subject/Topic Name 1>",
    "noteContent": "<Detailed notes for subject 1, with Mermaid diagrams embedded where appropriate.>"
  },
  {
    "subject": "<Subject/Topic Name 2>",
    "noteContent": "<Detailed notes for subject 2, with Mermaid diagrams embedded where appropriate.>"
  }
]

If there is only one subject, return an array with a single object.`
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