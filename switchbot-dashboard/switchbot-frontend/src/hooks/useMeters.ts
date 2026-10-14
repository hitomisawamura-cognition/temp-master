import { fetchMeters } from '../api/client';
import type { MetersResponse } from '../api/types';
import { useResource, type Resource } from './useResource';

export function useMeters(): Resource<MetersResponse> {
  return useResource(fetchMeters);
}
