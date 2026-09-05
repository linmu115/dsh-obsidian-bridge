/** Bounds headers and body reads, including fetch implementations that ignore abort. */
export function createRequestScope(fetchImpl: typeof fetch, timeoutMs = 10_000) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError("Request timeout must be positive");
  const controllers = new Set<AbortController>();
  return {
    abort() { for (const controller of controllers) controller.abort(); },
    async request(url: string, init: RequestInit = {}): Promise<Response> {
      init.signal?.throwIfAborted();
      const controller = new AbortController();
      controllers.add(controller);
      const abort = () => controller.abort(init.signal?.reason);
      init.signal?.addEventListener("abort", abort, { once: true });
      const timer = setTimeout(() => controller.abort(new DOMException("Bridge request timed out", "TimeoutError")), timeoutMs);
      let rejectAbort!: () => void;
      const aborted = new Promise<never>((_, reject) => {
        rejectAbort = () => reject(controller.signal.reason);
        controller.signal.addEventListener("abort", rejectAbort, { once: true });
      });
      try {
        return await Promise.race([
          (async () => {
            const response = await fetchImpl(url, { ...init, signal: controller.signal });
            const body = await response.arrayBuffer();
            controller.signal.throwIfAborted();
            return new Response(response.status === 204 || response.status === 205 || response.status === 304 ? null : body, {
              status: response.status, statusText: response.statusText, headers: response.headers,
            });
          })(),
          aborted,
        ]);
      } finally {
        clearTimeout(timer);
        controller.signal.removeEventListener("abort", rejectAbort);
        init.signal?.removeEventListener("abort", abort);
        controllers.delete(controller);
      }
    },
  };
}
