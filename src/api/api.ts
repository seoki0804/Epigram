import axios, { AxiosInstance, AxiosResponse } from 'axios';

const TEAMID = '11-안형석';

const PATHS = {
  AUTH: `/teamid/auth`.replace('teamId', TEAMID),
  USER: `/teamid/users`.replace('teamId', TEAMID),
  OAUTH: `/teamid/oauthApps`.replace('teamId', TEAMID),
  IMAGE: `/teamid/images/upload`.replace('teamId', TEAMID),
  EPIGRAM: `/teamid/epigrams`.replace('teamId', TEAMID),
  EMOTION_LOG: `/teamid/emotionLogs`.replace('teamId', TEAMID),
  COMMENT: `/teamid/comments`.replace('teamId', TEAMID),
};

const instance: AxiosInstance = axios.create({
  baseURL: 'https://fe-project-epigram-api.vercel.app/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로그인 accessToken 인터셉터
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 타입 정의
interface AuthResponse {
  accessToken: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  imageSource: string;
  nickname: string;
  createdAt: string;
}

interface EpigramResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentResponse {
  id: string;
  epigramId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const postSignIn = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response: AxiosResponse<AuthResponse> = await instance.post(
    `${PATHS.AUTH}/signIn`,
    { email, password }
  );
  return response.data;
};

export const postSignUp = async (
  email: string,
  password: string,
  name: string,
): Promise<{ message: string }> => {
  const response: AxiosResponse<{ message: string }> = await instance.post(
    `${PATHS.AUTH}/signUp`,
    { email, password, name }
  );
  return response.data;
};

// User API
export const getUser = async (): Promise<UserResponse> => {
  const response: AxiosResponse<UserResponse> = await instance.get(PATHS.USER);
  return response.data;
};

export const updateUserInfo = async (data: Partial<UserResponse>): Promise<UserResponse> => {
  const response: AxiosResponse<UserResponse> = await instance.patch(`${PATHS.USER}/me`, data);
  return response.data;
};

// Epigram API
export const getEpigrams = async (page: number = 1, pageSize: number = 10): Promise<EpigramResponse[]> => {
  const response: AxiosResponse<EpigramResponse[]> = await instance.get(PATHS.EPIGRAM, {
    params: { page, pageSize },
  });
  return response.data;
};

export const postEpigram = async (data: { content: string; author: string; sourceTitle?: string; sourceUrl?: string; tags?: string[] }): Promise<EpigramResponse> => {
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

// Comment API
export const postComment = async (data: { epigramId: string; content: string }): Promise<CommentResponse> => {
  const response: AxiosResponse<CommentResponse> = await instance.post(PATHS.COMMENT, data);
  return response.data;
};

export const getComments = async (): Promise<CommentResponse[]> => {
  const response: AxiosResponse<CommentResponse[]> = await instance.get(PATHS.COMMENT);
  return response.data;
};

export const updateComment = async (commentId: string, data: { content: string }): Promise<CommentResponse> => {
  const response: AxiosResponse<CommentResponse> = await instance.patch(`${PATHS.COMMENT}/${commentId}`, data);
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await instance.delete(`${PATHS.COMMENT}/${commentId}`);
};
