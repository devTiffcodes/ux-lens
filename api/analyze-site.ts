import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LighthouseAuditRef {
  id: string;
  weight: number;
  group?: string;
}

interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
}

export interface AnalyzeSiteResponse {
  url: string;
  fetchedAt: string;
  scores: {
    accessibility: number;
    bestPractices: number;
    seo: number;
    performance: number;
  };
  failingAudits: LighthouseAudit[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env['PAGESPEED_API_KEY'];
  const targetUrl = req.body?.url as string | undefined;

  if (!targetUrl) {
    res.status(400).json({ error: 'Missing "url" in request body' });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    res.status(400).json({ error: 'Please provide a valid http(s) URL' });
    return;
  }

  const categories = ['accessibility', 'best-practices', 'seo', 'performance'];
  const categoryParams = categories.map((c) => `category=${c}`).join('&');
  const apiKeyParam = apiKey ? `&key=${apiKey}` : '';

  const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    parsedUrl.toString()
  )}&${categoryParams}${apiKeyParam}`;

  try {
    const response = await fetch(pageSpeedUrl);

    if (!response.ok) {
      const errBody = await response.text();
      res.status(response.status).json({
        error: `PageSpeed Insights request failed: ${errBody}`,
      });
      return;
    }

    const data = await response.json();
    const lighthouseResult = data.lighthouseResult;

    if (!lighthouseResult) {
      res.status(502).json({ error: 'No Lighthouse result returned for this URL' });
      return;
    }

    const categoriesResult = lighthouseResult.categories;
    const audits: Record<string, LighthouseAudit> = lighthouseResult.audits;

    const scores = {
      accessibility: Math.round((categoriesResult.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categoriesResult['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categoriesResult.seo?.score ?? 0) * 100),
      performance: Math.round((categoriesResult.performance?.score ?? 0) * 100),
    };

    // Collect audit refs from the accessibility category specifically,
    // since that's our primary focus — then filter to only failing ones.
    const accessibilityAuditRefs: LighthouseAuditRef[] =
      categoriesResult.accessibility?.auditRefs ?? [];

    const failingAudits: LighthouseAudit[] = accessibilityAuditRefs
      .map((ref) => audits[ref.id])
      .filter(
        (audit): audit is LighthouseAudit =>
          !!audit &&
          audit.scoreDisplayMode === 'binary' &&
          audit.score !== null &&
          audit.score < 1
      );

    const result: AnalyzeSiteResponse = {
      url: parsedUrl.toString(),
      fetchedAt: new Date().toISOString(),
      scores,
      failingAudits,
    };

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown error analyzing site',
    });
  }
}
