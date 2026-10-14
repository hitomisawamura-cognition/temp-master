import { useCallback, useEffect, useRef, useState } from 'react';

export interface ResourceState<T> {
  data: T | null;
  error: string | null;
  updatedAt: Date | null;
}

export interface Resource<T> extends ResourceState<T> {
  reload: () => Promise<boolean>;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Holds the latest result of `fetcher`. `reload()` resolves to whether the
 * fetch succeeded; on failure the previous data is kept and `error` is set.
 * Responses that arrive after a newer request (or after unmount) are dropped.
 */
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>): Resource<T> {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, updatedAt: null });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
      controller.current?.abort();
    },
    [],
  );

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    try {
      const data = await fetcher(ctrl.signal);
      if (id !== requestId.current) return false;
      setState({ data, error: null, updatedAt: new Date() });
      return true;
    } catch (err) {
      if (id !== requestId.current) return false;
      setState((prev) => ({ ...prev, error: toMessage(err) }));
      return false;
    }
  }, [fetcher]);

  return { ...state, reload };
}
