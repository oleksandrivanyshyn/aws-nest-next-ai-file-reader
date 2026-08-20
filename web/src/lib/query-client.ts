import { QueryClient } from "@tanstack/react-query";

/**
 * A factory, not a singleton client — QueryProvider needs a fresh instance
 * per mount (see components/providers/query-provider.tsx), so the defaults
 * live here once and get reused rather than duplicated.
 *
 * Status polling (every 2s while a document is processing, per the product
 * brief) is NOT set here — that's a per-query `refetchInterval` on the
 * specific hook that needs it, not a global default every query inherits.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}
