const getBody = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  } else if (contentType && contentType.includes('text/')) {
    return response.text() as Promise<T>;
  } else {
    return response.arrayBuffer() as Promise<T>;
  }
};

export async function fetcher<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://admin-api.docs.keitaro.io';

  // Add authentication header if available
  const authHeader =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Convert HeadersInit to Record<string, string>
  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        requestHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        requestHeaders[key] = value;
      });
    } else {
      Object.assign(requestHeaders, options.headers);
    }
  }

  if (authHeader) {
    requestHeaders.Authorization = `Bearer ${authHeader}`;
  }

  // The path argument already includes query parameters if any.
  // No need to build queryString from options.url which doesn't exist on RequestInit.

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers: requestHeaders,
    body:
      options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body), // Stringify body if not FormData
  });

  // Handle errors first, then parse body
  if (!response.ok) {
    // Try to parse error body if available, otherwise use status text
    let errorBody: any = null;
    try {
      errorBody = await getBody(response);
    } catch (e) {
      // Ignore if body can't be parsed
    }
    throw new Error(
      errorBody?.message || `HTTP error! status: ${response.status}`,
    );
  }

  const data = await getBody<any>(response);

  return { data, status: response.status, headers: response.headers } as T;
}
