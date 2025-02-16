import axios, { AxiosInstance, AxiosResponse } from 'axios';

// .env.local에서 BASE_URL 가져오기
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fe-project-epigram-api.vercel.app/11-안형석';

// API 경로 설정
const PATHS = {
  AUTH: '/auth',
  USER: '/users',
  OAUTH: '/oauthApps',
  IMAGE: '/images/upload',
  EPIGRAM: '/epigrams',
  COMMENT: '/comments',
};

// Axiosinstance 설정
const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로그인 accessToken 인터셉터 추가
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 타입 정리
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
    teamId: string;
    updatedAt: string;
    createdAt: string;
    image: string | null;
  };
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  imageSource: string | null;
  nickname: string;
  createdAt: string;
}

export interface EpigramResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  tags?: string[];
  likes?: number;
  userId?: string;  // 🔹 추가됨
}

export interface CommentResponse {
  id: string;
  epigramId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  username?: string;
}

// ✅ Auth API
export const postSignIn = async (email: string, password: string): Promise<AuthResponse> => {
  const response: AxiosResponse<AuthResponse> = await instance.post(`${PATHS.AUTH}/signIn`, {
    email,
    password,
  });
  return response.data;
};

export const postSignUp = async (
  email: string,
  password: string,
  passwordConfirmation: string,
  nickname: string
): Promise<AuthResponse> => {
  const response: AxiosResponse<AuthResponse> = await instance.post(`${PATHS.AUTH}/signUp`, {
    email,
    password,
    passwordConfirmation,
    nickname,
  });
  return response.data;
};

// ✅ User API
export const getUser = async (): Promise<UserResponse> => {
  const response: AxiosResponse<UserResponse> = await instance.get(`${PATHS.USER}/me`);
  return response.data;
};

export const updateUserInfo = async (data: Partial<UserResponse>): Promise<UserResponse> => {
  const response: AxiosResponse<UserResponse> = await instance.patch(`${PATHS.USER}/me`, data);
  return response.data;
};

// ✅ Epigram API
export const getEpigrams = async (page: number = 1, pageSize: number = 10): Promise<EpigramResponse[]> => {
  const response: AxiosResponse<EpigramResponse[]> = await instance.get(PATHS.EPIGRAM, {
    params: { page, pageSize },
  });
  return response.data;
};

export const getEpigramById = async (epigramId: string): Promise<EpigramResponse> => {
  const response: AxiosResponse<EpigramResponse> = await instance.get(`${PATHS.EPIGRAM}/${epigramId}`);
  return response.data;
};

export const postEpigram = async (data: {
  content: string;
  author: string;
  sourceTitle?: string;
  sourceUrl?: string;
  tags?: string[];
}): Promise<EpigramResponse> => {
  const response: AxiosResponse<EpigramResponse> = await instance.post(PATHS.EPIGRAM, data);
  return response.data;
};

export const updateEpigram = async (epigramId: string, data: { content: string }): Promise<EpigramResponse> => {
  const response: AxiosResponse<EpigramResponse> = await instance.patch(`${PATHS.EPIGRAM}/${epigramId}`, data);
  return response.data;
};

export const deleteEpigram = async (epigramId: string): Promise<void> => {
  await instance.delete(`${PATHS.EPIGRAM}/${epigramId}`);
};

export const likeEpigram = async (epigramId: string): Promise<void> => {
  await instance.post(`${PATHS.EPIGRAM}/${epigramId}/like`);
};

export const unlikeEpigram = async (epigramId: string): Promise<void> => {
  await instance.delete(`${PATHS.EPIGRAM}/${epigramId}/like`);
};

// ✅ Comment API
export const postComment = async (data: { epigramId: string; content: string }): Promise<CommentResponse> => {
  const response: AxiosResponse<CommentResponse> = await instance.post(PATHS.COMMENT, data);
  return response.data;
};

export const getComments = async (epigramId: string): Promise<CommentResponse[]> => {
  const response: AxiosResponse<CommentResponse[]> = await instance.get(PATHS.COMMENT, {
    params: { epigramId },
  });
  return response.data;
};

export const updateComment = async (commentId: string, data: { content: string }): Promise<CommentResponse> => {
  const response: AxiosResponse<CommentResponse> = await instance.patch(`${PATHS.COMMENT}/${commentId}`, data);
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await instance.delete(`${PATHS.COMMENT}/${commentId}`);
};