// Nia API client — wraps the Nia REST API for use in Convex actions.
// Pure utility module, no "use node" needed.

const NIA_BASE_URL = "https://apigcp.trynia.ai/v2";

function getApiKey(): string {
  const key = process.env.NIA_API_KEY;
  if (!key) throw new Error("NIA_API_KEY environment variable is not set");
  return key;
}

async function niaFetch(
  path: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const resp = await fetch(`${NIA_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (resp.status === 429) {
    throw new Error("Nia API rate limit exceeded — try again later");
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "unknown error");
    throw new Error(`Nia API error ${resp.status}: ${text}`);
  }

  return resp.json();
}

// ── Types ──

export interface NiaSearchResult {
  title: string;
  snippet: string;
  source: string;
  url?: string;
  score?: number;
}

export interface NiaOracleResult {
  answer: string;
  sources: Array<{ title: string; url?: string }>;
  sessionId?: string;
}

// ── Search ──

/**
 * Universal search across all indexed Nia sources.
 * Hybrid semantic + keyword search.
 */
export async function niaUniversalSearch(
  query: string,
  topK: number = 10
): Promise<NiaSearchResult[]> {
  const data = await niaFetch("/search", {
    mode: "universal",
    query,
    top_k: topK,
    include_repos: true,
    include_docs: true,
    compress_output: false,
  });

  return normalizeSearchResults(data);
}

/**
 * AI-powered query search on specific indexed data sources.
 */
export async function niaQuerySearch(
  query: string,
  dataSources?: string[]
): Promise<{ answer: string; sources: NiaSearchResult[] }> {
  const body: Record<string, unknown> = {
    mode: "query",
    messages: [{ role: "user", content: query }],
    data_sources: dataSources ?? [],
    search_mode: "sources",
    stream: false,
    include_sources: true,
  };

  const data = (await niaFetch("/search", body)) as Record<string, unknown>;

  return {
    answer: typeof data.response === "string" ? data.response : "",
    sources: normalizeSearchResults(data),
  };
}

/**
 * Web search via Nia.
 */
export async function niaWebSearch(
  query: string,
  numResults: number = 5
): Promise<NiaSearchResult[]> {
  const data = await niaFetch("/search", {
    mode: "web",
    query,
    num_results: numResults,
  });

  return normalizeSearchResults(data);
}

// ── Oracle ──

/**
 * Run an Oracle deep research query (synchronous).
 */
export async function niaOracleRun(
  query: string,
  dataSources?: string[]
): Promise<NiaOracleResult> {
  const body: Record<string, unknown> = { query };
  if (dataSources?.length) body.data_sources = dataSources;

  const data = (await niaFetch("/oracle", body)) as Record<string, unknown>;

  return {
    answer: typeof data.answer === "string"
      ? data.answer
      : typeof data.response === "string"
        ? data.response
        : JSON.stringify(data),
    sources: Array.isArray(data.sources)
      ? (data.sources as Array<{ title?: string; url?: string }>).map((s) => ({
          title: s.title ?? "Unknown",
          url: s.url,
        }))
      : [],
    sessionId:
      typeof data.session_id === "string" ? data.session_id : undefined,
  };
}

/**
 * Start an async Oracle research job.
 */
export async function niaOracleJob(
  query: string,
  dataSources?: string[]
): Promise<string> {
  const body: Record<string, unknown> = { query };
  if (dataSources?.length) body.data_sources = dataSources;

  const data = (await niaFetch("/oracle/jobs", body)) as Record<
    string,
    unknown
  >;
  return typeof data.job_id === "string" ? data.job_id : String(data.id ?? "");
}

/**
 * Check the status of an async Oracle job.
 */
export async function niaOracleJobStatus(
  jobId: string
): Promise<{ status: string; result?: NiaOracleResult }> {
  const resp = await fetch(`${NIA_BASE_URL}/oracle/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  if (!resp.ok) throw new Error(`Nia API error ${resp.status}`);
  const data = (await resp.json()) as Record<string, unknown>;

  const status = typeof data.status === "string" ? data.status : "unknown";

  if (status === "completed" && data.result) {
    const result = data.result as Record<string, unknown>;
    return {
      status,
      result: {
        answer: typeof result.answer === "string" ? result.answer : "",
        sources: Array.isArray(result.sources)
          ? (result.sources as Array<{ title?: string; url?: string }>).map(
              (s) => ({ title: s.title ?? "Unknown", url: s.url })
            )
          : [],
      },
    };
  }

  return { status };
}

// ── Helpers ──

function normalizeSearchResults(data: unknown): NiaSearchResult[] {
  const obj = data as Record<string, unknown>;
  const results =
    (obj.results as unknown[]) ?? (obj.chunks as unknown[]) ?? [];

  return results.slice(0, 20).map((r) => {
    const item = r as Record<string, unknown>;
    return {
      title:
        (item.title as string) ??
        (item.file_path as string) ??
        (item.name as string) ??
        "Unknown",
      snippet:
        (item.snippet as string) ??
        (item.content as string) ??
        (item.text as string) ??
        "",
      source:
        (typeof item.source === "string" ? item.source : undefined) ??
        (typeof item.source === "object" && item.source !== null
          ? ((item.source as Record<string, unknown>).display_name as string) ??
            ((item.source as Record<string, unknown>).document_name as string)
          : undefined) ??
        (typeof item.source_name === "string" ? item.source_name : undefined) ??
        (typeof item.repository === "string" ? item.repository : undefined) ??
        "external",
      url: (item.url as string) ?? (item.link as string) ?? undefined,
      score:
        typeof item.score === "number"
          ? item.score
          : typeof item.relevance_score === "number"
            ? item.relevance_score
            : undefined,
    };
  });
}

/**
 * Generate a stable hash for cache keys.
 */
export function hashQuery(query: string, source: string): string {
  let hash = 0;
  const str = `${source}:${query}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `nia_${Math.abs(hash).toString(36)}`;
}
