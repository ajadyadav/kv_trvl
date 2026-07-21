export class LiteApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'LiteApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function fetchLiteApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.LITEAPI_KEY;
  if (!apiKey) {
    throw new LiteApiError('LiteAPI Key is not configured on the server', 500);
  }

  const baseUrl = 'https://api.liteapi.travel/v3.0';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers);
  headers.set('X-API-Key', apiKey);
  headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      throw new LiteApiError(
        data.message || data.error || `HTTP error! status: ${response.status}`,
        response.status,
        data.code || String(response.status),
        data
      );
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new LiteApiError('Request to LiteAPI timed out', 504);
    }
    if (error instanceof LiteApiError) {
      throw error;
    }
    throw new LiteApiError(error.message || 'An unexpected API error occurred', 500);
  }
}
