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
    res.status(400).json({ error: 'Missing pageName' }); return;
  }

  const issues = body.issues ?? [];
  const issuesList = issues.length
    ? issues.map((i: any) => `- [${i.severity}] ${i.title}: ${i.description} (Principle: ${i.principle ?? 'N/A'})`).join('\n')
    : 'No issues detected.';

  const isSiteAnalyzer = body.uxMode === 'poor' && body.pageName.startsWith('http');

  const uxLaws = `
UX LAWS AND PRINCIPLES TO REFERENCE (where relevant):
- Aesthetic-Usability Effect: visually appealing designs are perceived as more usable
- Choice Overload: too many options paralyse decision-making
- Chunking: grouping related information reduces cognitive load
- Cognitive Bias: users make decisions based on mental shortcuts, not logic
- Cognitive Load: minimise the mental effort required to use the interface
- Doherty Threshold: system response under 400ms increases productivity and engagement
- Fitts's Law: the time to reach a target depends on its size and distance
- Flow: users engage best when challenge matches skill level
- Goal-Gradient Effect: motivation increases as users get closer to completing a goal
- Hick's Law: more choices = longer decision time; simplify navigation and options
- Jakob's Law: users expect your site to work like sites they already know
- Law of Common Region: elements in the same bounded area are perceived as grouped
- Law of Proximity: objects near each other are perceived as related
- Law of Prägnanz: users perceive the simplest possible interpretation of an image
- Law of Similarity: similar-looking elements are perceived as related
- Law of Uniform Connectedness: visually connected elements are perceived as related
- Mental Model: users have expectations based on prior experience; match them
- Miller's Law: users can hold about 7 (±2) items in working memory at once
- Occam's Razor: the simplest design that works is usually the best
- Paradox of the Active User: users rarely read instructions; design for exploration
- Pareto Principle (FOCAL POINT): 80% of UX problems come from 20% of design issues — prioritise the highest-impact fixes first
- Parkinson's Law: work expands to fill the time available; apply to forms and tasks
- Peak-End Rule: users judge an experience by its peak moment and how it ends
- Postel's Law: be liberal in what you accept from users, strict in what you send
- Selective Attention: users notice what is relevant to them and ignore the rest
- Serial Position Effect: users remember the first and last items in a list best
- Tesler's Law: every system has irreducible complexity; don't push it onto the user
- Von Restorff Effect: distinctive elements are remembered better than similar ones
- Working Memory: keep interfaces simple enough to not overwhelm short-term memory
- Zeigarnik Effect: users remember incomplete tasks better than completed ones — use progress indicators
`;

  const prompt = isSiteAnalyzer
    ? `You are a UX mentor in a student research project called UX Lens. A developer has submitted the website "${body.pageName}" for a UX analysis.

Lighthouse audit results:
${issuesList}

${uxLaws}

IMPORTANT — Pareto Principle is the focal point of this project: identify the 20% of issues causing 80% of the UX damage and highlight them first.

${body.userQuestion?.trim() ? `The developer asks: ${body.userQuestion}` : ''}

Respond with:
1. A brief overall summary of the site's UX health (2-3 sentences)
2. The top 3 highest-impact issues mapped to specific UX laws from the list above (label each law clearly)
3. One quick win the developer can implement today
4. An encouraging closing line

Be warm, practical, and educational. Write for a student developer audience.`

    : `You are a friendly UX mentor in a student research project called UX Lens. You are reviewing the "${body.pageName}" page of a mock community platform called Mera, currently in ${body.uxMode} UX mode. The page has a wellbeing score of ${body.wellbeingScore}/100.

UX issues detected:
${issuesList}

${uxLaws}

IMPORTANT — Pareto Principle is the focal point of this project: identify which 20% of these issues are causing 80% of the usability damage.

${body.userQuestion?.trim() ? `The student asks: ${body.userQuestion}` : ''}

Give 2-4 short paragraphs of warm, educational mentor feedback. Map issues to specific UX laws from the list above where relevant. Highlight the highest-impact issues first. Be encouraging and suitable for a student researcher.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
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
