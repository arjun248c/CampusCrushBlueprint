// From Replit Auth blueprint
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthResponse {
  user?: User;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthResponse {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
  };
}
