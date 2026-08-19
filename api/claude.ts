export default async function handler(req: any, res: any): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) { res.status(500).json({ error: 'Missing API key' }); return; }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { res.status(400).json({ error: 'Bad JSON' }); return; }
  }
  if (!body || !body.pageName) {
    res.status(400).json({ error: `No pageName. body=${JSON.stringify(body)} type=${typeof req.body}` });
    return;
  }

  const issues = body.issues ?? [];
  const issuesList = issues.length
    ? issues.map((i: any) => `- [${i.severity}] ${i.title}: ${i.description}`).join('\n')
    : 'No issues detected.';

  const systemPrompt = `You are a friendly UX mentor in a student project called UX Lens. Page: "${body.pageName}", mode: ${body.uxMode}, wellbeing score: ${body.wellbeingScore}/100.\n\nIssues:\n${issuesList}\n\nGive 2-4 paragraphs of educational mentor feedback.`;

  const userContent = body.userQuestion?.trim() || `Analyze the ${body.pageName} page.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: errText });
      return;
    }

    const data = await response.json();
    const message = data.content?.find((b: any) => b.type === 'text')?.text ?? 'No response.';
    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
