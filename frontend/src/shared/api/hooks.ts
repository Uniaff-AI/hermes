export const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const DEFAULT_GC_TIME = 10 * 60 * 1000; // 10 minutes

export const createQueryOptions = <T>(
  staleTime: number = DEFAULT_STALE_TIME,
  gcTime: number = DEFAULT_GC_TIME
) => ({
  staleTime,
  gcTime,
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof Error && 'response' in error) {
      const response = (error as any).response;
      if (response?.status >= 400 && response?.status < 500) {
        return false;
      }
    }
    return failureCount < 3;
  },
});
