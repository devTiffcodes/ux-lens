export default async function handler(req: any, res: any): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) { res.status(500).json({ error: 'Missing Gemini API key' }); return; }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { res.status(400).json({ error: 'Bad JSON' }); return; }
  }
  if (!body || !body.pageName) {
    res.status(400).json({ error: 'Missing pageName' });
    return;
  }

  const issues = body.issues ?? [];
  const issuesList = issues.length
    ? issues.map((i: any) => `- [${i.severity}] ${i.title}: ${i.description}`).join('\n')
    : 'No issues detected.';

  const prompt = `You are a friendly UX mentor in a student research project called UX Lens. You are reviewing the "${body.pageName}" page of a mock community platform called Mera, currently in ${body.uxMode} UX mode. The page has a wellbeing score of ${body.wellbeingScore}/100.

UX issues detected:
${issuesList}

${body.userQuestion?.trim() ? `The student asks: ${body.userQuestion}` : ''}

Give 2-4 short paragraphs of warm, educational mentor feedback explaining what these issues mean for real users and why they matter. Reference UX principles like Nielsen's heuristics or WCAG where relevant. Be encouraging and suitable for a student researcher.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: errText });
      return;
    }

    const data = await response.json();
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      ?? 'No response generated.';

    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
