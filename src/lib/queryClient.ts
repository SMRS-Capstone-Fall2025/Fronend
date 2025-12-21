import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: "always",
      staleTime: 5 * 60 * 1000,
      refetchOnMount: "always",
    },
  },
});

export default queryClient;
