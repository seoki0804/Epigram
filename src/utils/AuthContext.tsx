"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe, signIn, signUp, tokenStore, User } from "@/api/api";

interface SignUpBody {
  email: string;
  nickname: string;
  password: string;
  passwordConfirmation: string;
}

interface AuthContextType {
  user: User | null;
  /** 저장된 토큰으로 사용자 정보를 확인하는 중이면 false */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: SignUpBody) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // 새로고침해도 로그인이 유지되도록, 저장된 토큰이 있으면 내 정보를 다시 받는다.
  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  // 실패하면 예외를 그대로 던져서 화면이 오류 문구를 보여 줄 수 있게 한다.
  const login = useCallback(async (email: string, password: string) => {
    const res = await signIn(email, password);
    tokenStore.set(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const register = useCallback(async (body: SignUpBody) => {
    const res = await signUp(body);
    tokenStore.set(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth는 AuthProvider 안에서 사용하세요.");
  return context;
};

/** 로그인이 필요한 화면에서 호출한다. 로그인하지 않았으면 로그인 화면으로 보내고, 로그인하면 돌아온다. */
export const useRequireAuth = () => {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  return { user, ready: ready && !!user };
};
