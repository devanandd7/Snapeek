import { serialize, parse } from 'cookie';

const SESSION_NAME = 'snapeek_session';

export function setSession(res, session) {
  const cookie = serialize(SESSION_NAME, JSON.stringify(session), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 3, // 3 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getSession(req) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies[SESSION_NAME]) return null;
  try {
    return JSON.parse(cookies[SESSION_NAME]);
  } catch {
    return null;
  }
}

export function clearSession(res) {
  const cookie = serialize(SESSION_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: -1,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.setHeader('Set-Cookie', cookie);
}
