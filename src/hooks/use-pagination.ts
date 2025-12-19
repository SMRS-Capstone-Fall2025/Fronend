import { useCallback, useMemo, useState } from "react";

export type UsePaginationOptions = {
  readonly initialPage?: number;
  readonly initialPageSize?: number;
};

export type PaginationState = {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly startItem: number;
  readonly endItem: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalItems: (totalItems: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
};

const clampTotalItems = (value: number) => Math.max(0, Math.floor(value));

export function usePagination(options?: UsePaginationOptions): PaginationState {
  const initialPage = options?.initialPage ?? 1;
  const initialPageSize = options?.initialPageSize ?? 5;

  type InternalState = {
    readonly page: number;
    readonly pageSize: number;
    readonly totalItems: number;
  };

  const [state, setState] = useState<InternalState>({
    page: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
  });

  const totalPages = useMemo(() => {
    const pages = Math.ceil(state.totalItems / state.pageSize);
    return Math.max(1, pages || 1);
  }, [state.pageSize, state.totalItems]);

  const setPage = useCallback((nextPage: number) => {
    setState((prev) => {
      const normalized = Math.max(1, Math.floor(nextPage));

      const hasTotal = prev.totalItems > 0;
      const maxPage = hasTotal
        ? Math.max(1, Math.ceil(prev.totalItems / prev.pageSize) || 1)
        : Number.POSITIVE_INFINITY;
      const clamped = hasTotal ? Math.min(normalized, maxPage) : normalized;
      if (clamped === prev.page) {
        return prev;
      }
      return {
        ...prev,
        page: clamped,
      };
    });
  }, []);

  const setPageSize = useCallback((nextPageSize: number) => {
    setState((prev) => {
      const normalizedSize = Math.max(1, Math.floor(nextPageSize));
      if (prev.pageSize === normalizedSize && prev.page === 1) {
        return prev;
      }
      return {
        ...prev,
        pageSize: normalizedSize,
        page: 1,
      };
    });
  }, []);

  const updateTotalItems = useCallback((count: number) => {
    setState((prev) => {
      const normalizedTotal = clampTotalItems(count);
      const maxPage = Math.max(
        1,
        Math.ceil(normalizedTotal / prev.pageSize) || 1
      );
      const nextPage = normalizedTotal === 0 ? 1 : Math.min(prev.page, maxPage);

      if (prev.totalItems === normalizedTotal && prev.page === nextPage) {
        return prev;
      }

      return {
        ...prev,
        totalItems: normalizedTotal,
        page: nextPage,
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => {
      const maxPage = Math.max(
        1,
        Math.ceil(prev.totalItems / prev.pageSize) || 1
      );
      const next = Math.min(prev.page + 1, maxPage);
      if (next === prev.page) {
        return prev;
      }
      return {
        ...prev,
        page: next,
      };
    });
  }, []);

  const previousPage = useCallback(() => {
    setState((prev) => {
      const next = Math.max(prev.page - 1, 1);
      if (next === prev.page) {
        return prev;
      }
      return {
        ...prev,
        page: next,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      page: initialPage,
      pageSize: initialPageSize,
      totalItems: 0,
    });
  }, [initialPage, initialPageSize]);

  const startItem =
    state.totalItems === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
  const endItem =
    state.totalItems === 0
      ? 0
      : Math.min(state.page * state.pageSize, state.totalItems);

  return {
    page: state.page,
    pageSize: state.pageSize,
    totalItems: state.totalItems,
    totalPages,
    startItem,
    endItem,
    hasNext: state.page < totalPages,
    hasPrevious: state.page > 1,
    setPage,
    setPageSize,
    setTotalItems: updateTotalItems,
    nextPage,
    previousPage,
    reset,
  };
}
