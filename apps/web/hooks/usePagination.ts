import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
  current: number;
  pageSize: number;
}

export interface UsePaginationOptions {
  defaultCurrent?: number;
  defaultPageSize?: number;
}

export interface UsePaginationReturn {
  /** Current pagination state */
  pagination: PaginationState;
  /** Antd Table-compatible pagination config */
  tablePagination: {
    current: number;
    pageSize: number;
    showSizeChanger: boolean;
    showTotal: (total: number, range: [number, number]) => string;
    pageSizeOptions: string[];
    onChange: (page: number, pageSize: number) => void;
  };
  /** API query params */
  queryParams: { skip: number; take: number; page: number; limit: number };
  /** Reset to page 1 (useful after filter changes) */
  reset: () => void;
}

/**
 * Pagination hook compatible with both antd Table and RTK Query.
 *
 * @example
 * const { tablePagination, queryParams } = usePagination();
 * const { data } = useGetEmployeesQuery(queryParams);
 * <Table pagination={tablePagination} />
 */
export function usePagination(
  options?: UsePaginationOptions,
): UsePaginationReturn {
  const [pagination, setPagination] = useState<PaginationState>({
    current: options?.defaultCurrent ?? 1,
    pageSize: options?.defaultPageSize ?? 25,
  });

  const onChange = useCallback((page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  }, []);

  const reset = useCallback(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const tablePagination = useMemo(
    () => ({
      current: pagination.current,
      pageSize: pagination.pageSize,
      showSizeChanger: true,
      showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} of ${total}`,
      pageSizeOptions: ["10", "25", "50", "100"],
      onChange,
    }),
    [pagination, onChange],
  );

  const queryParams = useMemo(
    () => ({
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
      page: pagination.current,
      limit: pagination.pageSize,
    }),
    [pagination],
  );

  return { pagination, tablePagination, queryParams, reset };
}
