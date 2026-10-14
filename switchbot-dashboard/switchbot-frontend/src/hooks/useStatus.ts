import { fetchStatus } from '../api/client';
import type { StatusResponse } from '../api/types';
import { useResource, type Resource } from './useResource';

export function useStatus(): Resource<StatusResponse> {
  return useResource(fetchStatus);
}
