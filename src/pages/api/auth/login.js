import clientPromise from '../../../components/lib/mongodb';
import { setSession } from '../../../components/lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  setSession(res, { email: user.email, username: user.username });
  res.status(200).json({ message: 'Login successful' });
}
