export default async function handler(req: any, res: any): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env['HF_API_KEY'];
  if (!apiKey) { res.status(500).json({ error: 'Missing HF API key' }); return; }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { res.status(400).json({ error: 'Bad JSON' }); return; }
  }
  if (!body || !body.pageName) {
    res.status(400).json({ error: `No pageName. body=${JSON.stringify(body)}` });
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

Give 2-4 short paragraphs of warm, educational mentor feedback explaining what these issues mean for real users and why they matter. Reference UX principles like Nielsen's heuristics or WCAG where relevant. Be encouraging and suitable for a student researcher.

Response:`;

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: errText });
      return;
    }

    const data = await response.json();
    const message = Array.isArray(data)
      ? data[0]?.generated_text?.trim() ?? 'No response generated.'
      : data?.generated_text?.trim() ?? 'No response generated.';

    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
