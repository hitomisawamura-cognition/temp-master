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
 * If a newer `reload()` starts while one is in flight, the older request is
 * aborted and its promise follows the newer one, so callers awaiting it only
 * resume once fresh data is in state. Responses after unmount are dropped.
 */
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>): Resource<T> {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, updatedAt: null });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const latest = useRef<Promise<boolean> | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
      latest.current = null;
      controller.current?.abort();
    },
    [],
  );

  const reload = useCallback(() => {
    const id = ++requestId.current;
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;

    const superseded = (): Promise<boolean> | false => {
      const next = latest.current;
      return next && next !== promise ? next : false;
    };

    const promise = (async (): Promise<boolean> => {
      try {
        const data = await fetcher(ctrl.signal);
        if (id !== requestId.current) return superseded();
        setState({ data, error: null, updatedAt: new Date() });
        return true;
      } catch (err) {
        if (id !== requestId.current) return superseded();
        setState((prev) => ({ ...prev, error: toMessage(err) }));
        return false;
      }
    })();
    latest.current = promise;
    return promise;
  }, [fetcher]);

  return { ...state, reload };
}
