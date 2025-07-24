import clientPromise from '../../components/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
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
      const o_id = new ObjectId(noteId);

      // First, find the note to get the image public_id
      const noteToDelete = await db.collection('notes').findOne({ _id: o_id, userId: session.email });

      if (!noteToDelete) {
        return res.status(404).json({ error: 'Note not found or you do not have permission to delete it' });
      }

      // If there's an image, delete it from Cloudinary
      if (noteToDelete.public_id) {
        await cloudinary.uploader.destroy(noteToDelete.public_id);
      }

      // Then, delete the note from the database
      const result = await db.collection('notes').deleteOne({ _id: o_id });

      if (result.deletedCount === 0) {
        // This case should ideally not be reached due to the check above, but it's good for safety
        return res.status(404).json({ error: 'Note not found during deletion' });
      }

      return res.status(200).json({ message: 'Note and associated image deleted successfully' });
    } catch (err) {
      console.error('Delete note error:', err);
      return res.status(500).json({ error: 'Failed to delete note', details: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
