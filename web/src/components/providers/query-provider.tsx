"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * A QueryClient per component instance, not a module-level singleton —
 * that would leak state between requests on the server. Standard App
 * Router pattern.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(createQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
