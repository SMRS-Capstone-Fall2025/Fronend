import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handle = globalThis.setTimeout(() => setDebouncedValue(value), delay);

    return () => globalThis.clearTimeout(handle);
  }, [value, delay]);

  return debouncedValue;
}
