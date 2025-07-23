import { ObjectId } from 'mongodb';
import clientPromise from '../../../components/lib/mongodb';
import axios from 'axios';
import { getSession } from '../../../components/lib/session';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { noteId } = req.query;
  if (!ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  const db = (await clientPromise).db();

  if (req.method === 'PUT') {
    const { noteContent, chatHistory, action = 'update_manual' } = req.body;

    if (action === 'update_manual' && !noteContent) {
      return res.status(400).json({ error: 'Note content is required for manual update.' });
    }
    if (action === 'update_ai' && (!noteContent || !chatHistory)) {
      return res.status(400).json({ error: 'Note content and chat history are required for AI update.' });
    }

    try {
      let finalContent = noteContent;

      if (action === 'update_ai') {
        const apiKey = process.env.GEMINI_API_KEY;
        const formattedChat = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
        const prompt = `You are an expert editor. Your task is to revise and update the following study notes based on the provided chat conversation. Incorporate the relevant information from the chat to improve the notes. Return ONLY the full, updated note content.\n\n---ORIGINAL NOTES---\n${noteContent}\n\n---CHAT HISTORY---\n${formattedChat}\n\n---UPDATED NOTES---`;
        
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const { data } = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        finalContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || noteContent;
      }

      const result = await db.collection('notes').updateOne(
        { _id: new ObjectId(noteId), userId: session.email },
        { $set: { noteContent: finalContent, lastModified: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Note not found or you do not have permission to edit it' });
      }

      return res.status(200).json({ message: 'Note updated successfully', updatedContent: finalContent });
    } catch (error) {
      console.error('Failed to update note:', error);
      return res.status(500).json({ error: 'Failed to update note' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
