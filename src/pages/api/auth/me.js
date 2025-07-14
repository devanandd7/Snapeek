import { getSession } from '../../../components/lib/session';

export default function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  res.status(200).json({ user: session });
}
