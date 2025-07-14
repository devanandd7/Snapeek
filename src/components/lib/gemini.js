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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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