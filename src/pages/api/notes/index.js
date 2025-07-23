import clientPromise from '../../../components/lib/mongodb';
import { getSession } from '../../../components/lib/session';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session || !session.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const db = (await clientPromise).db();
      const notes = await db
        .collection('notes')
        .find({ userId: session.email })
        .sort({ createdAt: -1 })
        .toArray();
      res.status(200).json({ notes });
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

