/**
 * Resilient API fetch wrapper with automated retries for transient server start delays
 */
export async function apiFetch(
  url: string,
  options?: RequestInit,
  retries = 3,
  delayMs = 500
): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const res = await fetch(url, options);
      if (res.status >= 500 && attempt < retries - 1) {
        // Server error (e.g. warming up), retry
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}
