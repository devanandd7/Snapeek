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
        // Filter for AI responses and format them.
        const aiResponses = chatHistory
          .filter(msg => msg.role === 'ai')
          .map(msg => msg.content)
          .join('\n\n'); // Separate responses with double newlines for clarity.

        // Append the AI responses to the original note content.
        if (aiResponses) {
          finalContent = `${noteContent}\n\n---\n\n## AI Assistant Notes\n\n${aiResponses}`;
        }
      }

      const result = await db.collection('notes').updateOne(
        { _id: new ObjectId(noteId), userId: session.email },
        { $set: { noteContent: finalContent, lastModified: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Note not found or you do not have permission to edit it' });
      }

      const updatedNote = await db.collection('notes').findOne({ _id: new ObjectId(noteId) });
      return res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
    } catch (error) {
      console.error('Failed to update note:', error);
      return res.status(500).json({ error: 'Failed to update note' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
