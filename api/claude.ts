import type { VercelRequest, VercelResponse } from '@vercel/node';

interface MentorRequestBody {
  pageName: string;
  uxMode: 'good' | 'poor';
  issues: Array<{
    title: string;
    severity: string;
    description: string;
    principle: string;
    recommendation: string;
  }>;
  wellbeingScore: number;
  userQuestion?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    res.status(500).json({ error: 'Server misconfiguration: missing API key' });
    return;
  }

  const body = req.body as MentorRequestBody;
  const { pageName, uxMode, issues, wellbeingScore, userQuestion } = body;

  const issuesList = issues.length
    ? issues
      .map(
        (issue) =>
          `- [${issue.severity}] ${issue.title}: ${issue.description} (violates: ${issue.principle}; fix: ${issue.recommendation})`
      )
      .join('\n')
    : 'No issues detected on this page.';

  const systemPrompt = `You are a friendly, encouraging UX mentor embedded in a student's final year project called "UX Lens". You are looking at the "${pageName}" page of a mock community platform called Mera, currently in ${uxMode.toUpperCase()} UX mode. The page has a wellbeing score of ${wellbeingScore}/100.

Detected UX issues on this page:
${issuesList}

Explain, in a supportive and educational tone suited to a student researcher, what these issues mean for real users and why they matter, referencing UX principles where relevant. Keep your response to 2-4 short paragraphs. Do not repeat the raw issue list verbatim — synthesize it into mentor-style guidance.`;

  const userContent =
    userQuestion && userQuestion.trim().length > 0
      ? userQuestion
      : `Give me your mentor analysis of the ${pageName} page.`;

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
    const message =
      data.content?.find((block: { type: string }) => block.type === 'text')
        ?.text ?? 'The mentor had nothing to say about this page.';

    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown error calling Claude API',
    });
  }
}
