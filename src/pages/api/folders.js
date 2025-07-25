import clientPromise from '../../components/lib/mongodb';
import { getSession } from '../../components/lib/session';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'DELETE') {
    const { folder } = req.body;
    if (!folder || folder === 'All Images') {
      return res.status(400).json({ error: 'Invalid folder name' });
    }
    try {
      const db = (await clientPromise).db();
      // Remove all images belonging to this user and folder
      const deleteResult = await db.collection('images').deleteMany({ userId: session.email, folder });
      // Optionally, also remove related notes if needed (uncomment if desired)
      // await db.collection('notes').deleteMany({ userId: session.email, folder });
      return res.status(200).json({ success: true, deletedCount: deleteResult.deletedCount });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete folder', details: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
