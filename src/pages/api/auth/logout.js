import { clearSession } from '../../../components/lib/session';

export default function handler(req, res) {
  clearSession(res);
  res.status(200).json({ message: 'Logged out' });
}
