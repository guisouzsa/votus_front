'use client';

import { SWRConfig } from 'swr';

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 30000,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
