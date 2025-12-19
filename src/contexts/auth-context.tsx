import { useAuthAccountStore } from "@/lib/auth-store";
import type { Role, User } from "@/lib/types";
import { getDefaultRouteByRole, normalizeRole } from "@/lib/utils";
import { useLoginMutation, useMeQuery } from "@/services/account/hooks";
import type {
  AccountDto,
  CouncilManagerProfile,
  LoginRequest,
  MajorDto,
  MeResponse,
} from "@/services/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (credentials: LoginRequest) => Promise<void>;

  loginWithToken: (
    token: string,
    opts?: { email?: string; role?: string; name?: string; avatar?: string }
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAccount = useAuthAccountStore((state) => state.setAccount);
  const clearAccount = useAuthAccountStore((state) => state.clear);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      setToken(token);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (!token) {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
    setInitialized(true);
  }, []);

  const {
    isLoading: meLoading,
    data: meResponse,
    isError: meError,
  } = useMeQuery({
    enabled: initialized && Boolean(token),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!initialized) return;

    if (!token) {

      setAccount(null);
      setUser(null);
      localStorage.removeItem("user");
      return;
    }

    const rawAccount = (meResponse as MeResponse | undefined)?.data ?? null;
    let account: AccountDto | null = null;

    if (rawAccount) {
      account = {
        ...rawAccount,
        major: rawAccount.major ? normalizeMajor(rawAccount.major) : null,
        councilManagerProfile: rawAccount.councilManagerProfile
          ? normalizeCouncilManagerProfile(rawAccount.councilManagerProfile)
          : null,
      };
    }

    setAccount(account);

    if (account) {
      const normalized = mapAccountToUser(account);
      setUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, [meResponse, initialized, token, setAccount]);

  useEffect(() => {
    if (meError) {
      clearAccount();
    }
  }, [meError, clearAccount]);

  const loginMutation = useLoginMutation();

  const loginWithToken = useCallback(
    (
      token: string,
      opts?: { email?: string; role?: string; name?: string; avatar?: string }
    ) => {
      try {

        localStorage.setItem("token", token);

        const serverRole = opts?.role;

        const normalizedRole = normalizeRole(serverRole);

        const roleMap: Record<string, Role> = {
          student: "student",
          instructor: "instructor",
          lecturer: "mentor",
          mentor: "mentor",
          staff: "staff",
          admin: "admin",
          dean: "dean",
        };

        let role: Role = "student";
        if (normalizedRole) {

          role = roleMap[normalizedRole] ?? "student";
        } else if (serverRole) {

          const lowercasedRole = String(serverRole).toLowerCase();
          role = roleMap[lowercasedRole] ?? "student";
        }

        if (
          serverRole &&
          role === "student" &&
          serverRole.toLowerCase() !== "student"
        ) {
          console.warn(
            `Role mapping issue: serverRole="${serverRole}", normalizedRole="${normalizedRole}", mapped role="${role}"`
          );
        }

        const email = opts?.email ?? "user@example.com";
        const name = opts?.name ?? email.split("@")[0] ?? "User";
        const avatar = opts?.avatar ?? null;
        const tempUser: User = {
          id: email,
          name,
          email,
          avatar,
          role,
        };

        clearAccount();
        localStorage.setItem("user", JSON.stringify(tempUser));
        setUser(tempUser);
        setToken(token);

        queryClient.invalidateQueries({ queryKey: ["accounts", "me"] });

        const roleForNavigation = serverRole || role;
        const defaultRoute = getDefaultRouteByRole(roleForNavigation);

        console.log("[loginWithToken] Navigation:", {
          serverRole,
          normalizedRole,
          mappedRole: role,
          roleForNavigation,
          defaultRoute,
        });

        navigate(defaultRoute, { replace: true });
      } catch (error) {
        console.error("Failed to persist token/user", error);
      }
    },
    [navigate, queryClient, clearAccount]
  );

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      try {
        const response = await loginMutation.mutateAsync(credentials);
        const token = response.data?.token;

        if (!token) {
          throw new Error("Không nhận được token từ server");
        }

        loginWithToken(token, {
          email: response.data?.email ?? credentials.email,
          role: response.data?.role,
        });
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [loginMutation, loginWithToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    clearAccount();

    queryClient.clear();
    navigate("/login");
  }, [navigate, queryClient, clearAccount]);

  const loading = !initialized || (Boolean(token) && meLoading);

  const value = useMemo(
    () => ({ user, loading, login, loginWithToken, logout }),
    [user, loading, login, loginWithToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const normalizeMajor = (value: unknown): MajorDto | null => {
  if (!value || typeof value !== "object") return null;
  const major = value as Record<string, unknown>;
  return {
    id: typeof major.id === "number" ? major.id : undefined,
    name: typeof major.name === "string" ? major.name : null,
    code: typeof major.code === "string" ? major.code : null,
    description:
      typeof major.description === "string" ? major.description : null,
    isActive:
      typeof major.isActive === "boolean" ? major.isActive : undefined,
  };
};

const normalizeCouncilManagerProfile = (
  value: unknown
): CouncilManagerProfile | null => {
  if (!value || typeof value !== "object") return null;
  const profile = value as Record<string, unknown>;
  return {
    profileId:
      typeof profile.profileId === "number" ? profile.profileId : null,
    employeeCode:
      typeof profile.employeeCode === "string" ? profile.employeeCode : null,
    positionTitle:
      typeof profile.positionTitle === "string" ? profile.positionTitle : null,
    department:
      typeof profile.department === "string" ? profile.department : null,
    status: typeof profile.status === "string" ? profile.status : null,
  };
};

function mapAccountToUser(account: AccountDto): User {
  const fallbackEmail = account.email ?? "user@example.com";
  const roleCandidate = account.role ?? "student";

  const normalizedRole = normalizeRole(roleCandidate);

  const roleToMap = normalizedRole ?? String(roleCandidate).toLowerCase();

  const roleMap: Record<string, Role> = {
    student: "student",
    instructor: "instructor",
    lecturer: "mentor",
    mentor: "mentor",
    staff: "staff",
    admin: "admin",
    dean: "dean",
  };
  const role = roleMap[roleToMap] ?? "student";

  const name =
    account.fullName?.trim() || account.name?.trim() || fallbackEmail || "User";

  const avatar =
    account.avatar?.trim() ||
    `https://avatar.vercel.sh/${encodeURIComponent(fallbackEmail || name)}`;

  return {
    id: String(account.id ?? fallbackEmail ?? name),
    name,
    email: fallbackEmail,
    avatar,
    role,
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
