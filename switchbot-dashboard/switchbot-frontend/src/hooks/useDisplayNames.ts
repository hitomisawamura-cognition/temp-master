import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BUILD_DISPLAY_NAMES,
  DISPLAY_NAMES_URL,
  getDisplayName,
  parseDisplayNames,
  type DisplayNameMap,
} from '@/config/displayNames';

async function fetchRuntimeDisplayNames(): Promise<DisplayNameMap> {
  const response = await fetch(DISPLAY_NAMES_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) return {};
  try {
    return parseDisplayNames(await response.json());
  } catch {
    return {};
  }
}

/** Returns a resolver: runtime JSON (VITE_DISPLAY_NAMES_URL) > VITE_DISPLAY_NAMES > defaults. */
export function useDisplayNames(): (deviceName: string) => string {
  const { data: runtime } = useQuery({
    queryKey: ['display-names', DISPLAY_NAMES_URL],
    queryFn: fetchRuntimeDisplayNames,
    enabled: DISPLAY_NAMES_URL !== '',
    staleTime: Infinity,
  });

  return useCallback(
    (deviceName: string) => getDisplayName(deviceName, runtime ? { ...BUILD_DISPLAY_NAMES, ...runtime } : BUILD_DISPLAY_NAMES),
    [runtime],
  );
}
