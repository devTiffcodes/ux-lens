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

  // ── WIREFRAME BRANCH ──────────────────────────────────────────────────────
  if (body?.type === 'wireframe') {
    if (!body.image || !body.mimeType) {
      res.status(400).json({ error: 'Missing image or mimeType' }); return;
    }

    const wireframePrompt = `You are a UX mentor in a student research project called UX Lens. A developer has uploaded a wireframe or UI screenshot for UX review.

${uxLaws}

IMPORTANT — Pareto Principle is the focal point: identify the 20% of design decisions causing 80% of potential UX problems.

Analyze this wireframe/screenshot and respond with:
1. A brief overall UX health summary (2-3 sentences)
2. The top 3 highest-impact issues you can see, each mapped to a specific UX law from the list above (label the law clearly)
3. One quick win the developer can implement today
4. An encouraging closing line

Be warm, practical, and educational. Write for a student developer audience.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: body.mimeType, data: body.image } },
                { text: wireframePrompt },
              ],
            }],
            generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({ error: errText }); return;
      }

      const data = await response.json();
      const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'No feedback returned.';
      res.status(200).json({ feedback });
      return;
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
  }

  // ── URL / MERA MENTOR BRANCH ──────────────────────────────────────────────
  if (!body || !body.pageName) {
    res.status(400).json({ error: 'Missing pageName' }); return;
  }

  const issues = body.issues ?? [];
  const issuesList = issues.length
    ? issues.map((i: any) => `- [${i.severity}] ${i.title}: ${i.description} (Principle: ${i.principle ?? 'N/A'})`).join('\n')
    : 'No issues detected.';

  const isSiteAnalyzer = body.pageName.startsWith('http');

  if (isSiteAnalyzer) {
    // ── SITE ANALYZER — returns JSON with feedback + uxLawScores ─────────────
    const prompt = `You are a UX mentor in a student research project called UX Lens. A developer has submitted the website "${body.pageName}" for a UX analysis.

Lighthouse audit results:
${issuesList}

${uxLaws}

IMPORTANT — Pareto Principle is the focal point: identify the 20% of issues causing 80% of the UX damage and highlight them first.

${body.userQuestion?.trim() ? `The developer asks: ${body.userQuestion}` : ''}

You MUST respond with ONLY a valid JSON object — no markdown, no backticks, no explanation outside the JSON.

The JSON must follow this exact structure:
{
  "feedback": "Your warm, practical mentor feedback here (4-6 sentences). Summarise overall UX health, call out the top Pareto-priority issues, give one quick win, and end encouragingly.",
  "uxLawScores": [
    {
      "category": "Performance",
      "laws": [
        { "law": "Doherty Threshold", "status": "fail", "score": 20, "note": "Page load exceeds 400ms significantly." },
        { "law": "Occam's Razor", "status": "pass", "score": 85, "note": "No unnecessary bloat detected." }
      ]
    },
    {
      "category": "Accessibility",
      "laws": [
        { "law": "Fitts's Law", "status": "partial", "score": 55, "note": "Some tap targets are below recommended size." }
      ]
    },
    {
      "category": "Cognitive",
      "laws": [
        { "law": "Cognitive Load", "status": "pass", "score": 80, "note": "Interface appears uncluttered." },
        { "law": "Miller's Law", "status": "pass", "score": 75, "note": "Navigation items within acceptable range." }
      ]
    },
    {
      "category": "Visual & Perception",
      "laws": [
        { "law": "Aesthetic-Usability Effect", "status": "partial", "score": 60, "note": "Design is functional but lacks visual polish." }
      ]
    },
    {
      "category": "Navigation & Structure",
      "laws": [
        { "law": "Jakob's Law", "status": "pass", "score": 78, "note": "Follows familiar conventions." },
        { "law": "Hick's Law", "status": "pass", "score": 82, "note": "Options feel manageable." }
      ]
    }
  ]
}

Use only laws from the provided list. Assign each law a score 0–100 and a status: "pass" (score ≥ 70), "partial" (40–69), or "fail" (below 40). Base scores on the Lighthouse audit data provided. Always include the Pareto Principle in the most relevant category with a note explaining its role. Cover at least 10 laws total across all categories.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1200, temperature: 0.4 },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({ error: errText }); return;
      }

      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      let parsed: any;
      try {
        const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        parsed = JSON.parse(clean);
      } catch {
        // Fallback: return raw text as feedback only
        res.status(200).json({ message: raw, uxLawScores: [] });
        return;
      }

      res.status(200).json({
        message: parsed.feedback ?? 'No feedback returned.',
        uxLawScores: parsed.uxLawScores ?? [],
      });
      return;
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      return;
    }
  }

  // ── MERA MENTOR BRANCH ────────────────────────────────────────────────────
  const prompt = `You are a friendly UX mentor in a student research project called UX Lens. You are reviewing the "${body.pageName}" page of a mock student dashboard called Mera, currently in ${body.uxMode} UX mode. The page has a wellbeing score of ${body.wellbeingScore}/100.

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
      res.status(response.status).json({ error: errText }); return;
    }

    const data = await response.json();
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'No response generated.';
    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
