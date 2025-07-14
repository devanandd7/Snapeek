import clientPromise from '../../../components/lib/mongodb';
import { analyzeImageWithGemini } from '../../../components/lib/gemini';
import { getSession } from '../../../components/lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { imageId } = req.body;
  if (!imageId) return res.status(400).json({ error: 'Image ID required' });

  const client = await clientPromise;
  const db = client.db();
  const image = await db.collection('images').findOne({ _id: imageId, userId: session.email });

  if (!image) return res.status(404).json({ error: 'Image not found' });

  try {
    const description = await analyzeImageWithGemini(image.url);
    await db.collection('images').updateOne(
      { _id: imageId },
      { $set: { description } }
    );
    res.status(200).json({ description });
  } catch (err) {
    res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
}
