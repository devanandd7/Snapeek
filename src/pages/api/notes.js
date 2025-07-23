import clientPromise from '../../components/lib/mongodb';
import { getSession } from '../../components/lib/session';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    try {
      const db = (await clientPromise).db();
      const notes = await db
        .collection('notes')
        .find({ userId: session.email })
        .sort({ createdAt: -1 })
        .toArray();
      
      return res.status(200).json({ notes });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch notes', details: err.message });
    }
  }

  if (req.method === 'POST') {
    // For future: manual note creation
    const { noteContent, subject, noteType } = req.body;
    if (!noteContent) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    try {
      const db = (await clientPromise).db();
      const noteDoc = {
        userId: session.email,
        noteContent,
        noteType: noteType || 'manual',
        subject: subject || 'general',
        createdAt: new Date(),
        lastModified: new Date()
      };
      
      await db.collection('notes').insertOne(noteDoc);
      return res.status(201).json({ note: noteDoc });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create note', details: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    try {
      const db = (await clientPromise).db();
      const result = await db.collection('notes').deleteOne({ 
        _id: noteId, 
        userId: session.email 
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      return res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete note', details: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
