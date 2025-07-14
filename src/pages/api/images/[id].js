import cloudinary from '../../../components/lib/cloudinary';
import clientPromise from '../../../components/lib/mongodb';
import { getSession } from '../../../components/lib/session';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.query; // id is the public_id
  if (!id) return res.status(400).json({ error: 'Image ID required' });

  if (req.method === 'DELETE') {
    try {
      const db = (await clientPromise).db();
      // Find the image and ensure it belongs to the user
      const image = await db.collection('images').findOne({ public_id: id, userId: session.email });
      if (!image) return res.status(404).json({ error: 'Image not found' });
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(id);
      // Delete from MongoDB
      await db.collection('images').deleteOne({ public_id: id });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete image', details: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
