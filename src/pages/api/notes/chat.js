import { getSession } from '../../../components/lib/session';
import axios from 'axios';



export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'POST') {
    const { noteContent, userMessage } = req.body;

    if (!noteContent || !userMessage) {
      return res.status(400).json({ error: 'Note content and user message are required.' });
    }

    try {
            const apiKey = process.env.GEMINI_API_KEY;
      const prompt = `You are a helpful study assistant. Based on the following study notes, please answer the user's question. Keep your answer concise and directly related to the notes provided.\n\n---STUDY NOTES---\n${noteContent}\n\n---USER QUESTION---\n${userMessage}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.';

      return res.status(200).json({ reply: text });
    } catch (error) {
      console.error('AI chat error:', error);
      return res.status(500).json({ error: 'Failed to get response from AI.' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
