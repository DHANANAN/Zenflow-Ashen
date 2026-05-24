export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, action } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Turnstile token missing.' });
  }

  // Cloudflare secret key
  const SECRET_KEY = '0x4AAAAAADVFkYzji5dd--lc51ihQ0I-1xA';

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${SECRET_KEY}&response=${token}`
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({
        success: true,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
        action: action || data.action || 'auth',
        cdata: data.cdata || 'no-custom-data',
        message: 'Cloudflare Turnstile token validated successfully on the backend!'
      });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Security verification failed.',
        details: data['error-codes']
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal validation server error.' });
  }
}
