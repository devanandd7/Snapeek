import clientPromise from '../../../components/lib/mongodb';
import User from '../../../components/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const client = await clientPromise;
  const db = client.db();
  const existing = await db.collection('users').findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const user = new User({ username, email, password });
  await db.collection('users').insertOne(user);

  res.status(201).json({ message: 'User registered' });
}
