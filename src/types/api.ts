import { ReactNode } from 'react';

// Auth types
export interface AuthSignInResponse {
  user: string;
  email: ReactNode;
  accessToken: string;
  token: string;
  userId: string;
}

export interface AuthSignUpResponse {
  userId: string;
  message: string;
  name: string;
}

// Folder types
export interface FolderResponse {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Link types
export interface LinkResponse {
  favorite: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imageSource: any;
  id: number;
  folderId: string;
  url: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any;
}

export interface CardListResponse {
  totalCount: number;
  list: LinkResponse[];
}

// OAuth types
export interface OAuthAppResponse {
  id: string;
  name: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}

// User types
export interface UserResponse {
  imageSource: ReactNode;
  name: ReactNode;
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface EpigramResponse {
  id: string;
  content: string;
  author?: string;  // 선택적 필드로 변경
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  userId?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  likes?: number;
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
