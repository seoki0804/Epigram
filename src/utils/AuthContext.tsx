'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { postSignIn, getUser, UserResponse } from '@/api/api';

interface AuthContextType {
  accessToken: string | null;
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);

  // 새로고침 시 로컬 스토리지에서 accessToken 및 사용자 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    console.log("🔍 Stored AccessToken:", token); // 디버깅

    if (token) {
      setAccessToken(token);
      fetchUserData();
    }
  }, []);

  // 사용자 정보 가져오기
  const fetchUserData = async () => {
    try {
      const userData = await getUser();
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('🚨 유저 데이터를 불러오는데 실패했습니다:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("🔍 로그인 요청:", email, password);
      const response = await postSignIn(email, password);
  
      if (response.accessToken) {
        console.log("✅ 로그인 성공! 토큰 저장:", response.accessToken);
        localStorage.setItem("accessToken", response.accessToken);
        setAccessToken(response.accessToken);
  
        // 🔹 유저 정보 가져오기
        console.log("🔍 로그인 후 유저 데이터 요청 실행...");
        const userData = await getUser().catch((error) => {
          console.error("🚨 유저 데이터 요청 실패:", error);
        });
  
        if (userData) {
          console.log("✅ 유저 데이터:", userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        } else {
          console.error("🚨 유저 데이터를 불러오는데 실패했습니다.");
        }
      } else {
        throw new Error("🚨 로그인 응답에 토큰이 없습니다.");
      }
    } catch (error) {
      console.error("🚨 로그인 실패:", error);
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용하세요.');
  }
  return context;
};