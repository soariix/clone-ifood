import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): [T, () => void] {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  ) as T;

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return [debounced, cancel];
}
