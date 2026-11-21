import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// 팀 단위로 분리된 코드잇 Epigram API. .env.local 의 NEXT_PUBLIC_API_BASE_URL 로 바꿀 수 있다.
// 팀 ID는 영문으로 둔다. 한글 팀 ID(예: 11-안형석)는 가입·로그인은 되지만,
// 로그인이 필요한 요청(글쓰기·좋아요·댓글·내 정보)이 서버에서 모두 403으로 거절된다.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://fe-project-epigram-api.vercel.app/11-hyeongseok-an";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

// ── 타입 (API 명세 기준) ─────────────────────────────────────
export interface User {
  id: number;
  nickname: string;
  image: string | null;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Epigram {
  id: number;
  content: string;
  author: string;
  referenceTitle: string | null;
  referenceUrl: string | null;
  writerId: number;
  likeCount: number;
  tags: Tag[];
}

export interface EpigramDetail extends Epigram {
  isLiked?: boolean;
}

export interface EpigramInput {
  content: string;
  author: string;
  referenceTitle?: string;
  referenceUrl?: string;
  tags: string[];
}

export interface Comment {
  id: number;
  epigramId: number;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  writer: { id: number; nickname: string; image: string | null };
}

export interface Page<T> {
  list: T[];
  nextCursor: number | null;
  totalCount: number;
}

// ── 토큰 보관 ────────────────────────────────────────────────
const isBrowser = () => typeof window !== "undefined";

export const tokenStore = {
  get: () => (isBrowser() ? localStorage.getItem(TOKEN_KEY) : null),
  set: (access: string, refresh?: string) => {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("user");
  },
};

// ── Axios ───────────────────────────────────────────────────
const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// accessToken 이 만료되면 refreshToken 으로 한 번만 다시 받아 재요청한다.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<{ accessToken: string }>(
      `${BASE_URL}/auth/refresh-token`,
      { refreshToken }
    );
    tokenStore.set(data.accessToken);
    return data.accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (error.response?.status !== 401 || !original || original._retried) throw error;
    original._retried = true;
    refreshing = refreshing ?? refreshAccessToken().finally(() => (refreshing = null));
    const token = await refreshing;
    if (!token) throw error;
    original.headers.Authorization = `Bearer ${token}`;
    return instance(original);
  }
);

/** API 오류를 사용자에게 보여 줄 문장으로 바꾼다. 서버의 영어 기본 문구는 그대로 보여 주지 않는다. */
export function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message;
    const status = error.response?.status;
    if (status && status >= 500) return fallback;
    if (msg === "Validation Failed") return "입력한 값을 다시 확인해 주세요.";
    if (msg && /[가-힣]/.test(msg)) return msg;
    if (status === 404) return "찾을 수 없습니다. 삭제되었을 수 있습니다.";
    if (status === 403) return "권한이 없습니다.";
    if (error.response?.status === 401) return "로그인이 필요합니다.";
    if (!error.response) return "서버에 연결하지 못했습니다. 네트워크를 확인해 주세요.";
  }
  return fallback;
}

// ── Auth ────────────────────────────────────────────────────
export const signIn = async (email: string, password: string) =>
  (await instance.post<AuthResponse>("/auth/signIn", { email, password })).data;

export const signUp = async (body: {
  email: string;
  nickname: string;
  password: string;
  passwordConfirmation: string;
}) => (await instance.post<AuthResponse>("/auth/signUp", body)).data;

export const getMe = async () => (await instance.get<User>("/users/me")).data;

// ── Epigram ─────────────────────────────────────────────────
export const getEpigrams = async (params: {
  limit: number;
  cursor?: number | null;
  keyword?: string;
  writerId?: number;
}) => {
  const { cursor, keyword, ...rest } = params;
  return (
    await instance.get<Page<Epigram>>("/epigrams", {
      params: {
        ...rest,
        ...(cursor ? { cursor } : {}),
        ...(keyword ? { keyword } : {}),
      },
    })
  ).data;
};

export const getEpigram = async (id: number | string) =>
  (await instance.get<EpigramDetail>(`/epigrams/${id}`)).data;

const cleanInput = (input: EpigramInput) => ({
  content: input.content.trim(),
  author: input.author.trim(),
  tags: input.tags,
  ...(input.referenceTitle?.trim() ? { referenceTitle: input.referenceTitle.trim() } : {}),
  ...(input.referenceUrl?.trim() ? { referenceUrl: input.referenceUrl.trim() } : {}),
});

export const createEpigram = async (input: EpigramInput) =>
  (await instance.post<EpigramDetail>("/epigrams", cleanInput(input))).data;

export const updateEpigram = async (id: number | string, input: EpigramInput) =>
  (await instance.patch<EpigramDetail>(`/epigrams/${id}`, cleanInput(input))).data;

export const deleteEpigram = async (id: number | string) => {
  await instance.delete(`/epigrams/${id}`);
};

export const likeEpigram = async (id: number | string) =>
  (await instance.post<EpigramDetail>(`/epigrams/${id}/like`)).data;

export const unlikeEpigram = async (id: number | string) =>
  (await instance.delete<EpigramDetail>(`/epigrams/${id}/like`)).data;

export const getTodayEpigram = async () =>
  (await instance.get<EpigramDetail | null>("/epigrams/today")).data;

// ── Emotion ─────────────────────────────────────────────────
export type Emotion = "MOVED" | "HAPPY" | "WORRIED" | "SAD" | "ANGRY";

export interface EmotionLog {
  id: number;
  userId: number;
  emotion: Emotion;
  createdAt: string;
}

export const getTodayEmotion = async (userId: number) =>
  (await instance.get<EmotionLog | null>("/emotionLogs/today", { params: { userId } })).data;

export const saveTodayEmotion = async (emotion: Emotion) =>
  (await instance.post<EmotionLog>("/emotionLogs/today", { emotion })).data;

export const getMonthlyEmotions = async (userId: number, year: number, month: number) =>
  (await instance.get<EmotionLog[]>("/emotionLogs/monthly", { params: { userId, year, month } })).data;

// ── User ────────────────────────────────────────────────────
export const updateMe = async (body: { nickname?: string; image?: string }) =>
  (await instance.patch<User>("/users/me", body)).data;

export const getUserComments = async (userId: number, params: { limit: number; cursor?: number | null }) =>
  (
    await instance.get<Page<Comment>>(`/users/${userId}/comments`, {
      params: { limit: params.limit, ...(params.cursor ? { cursor: params.cursor } : {}) },
    })
  ).data;

// ── Comment ─────────────────────────────────────────────────
export const getRecentComments = async (params: { limit: number; cursor?: number | null }) =>
  (
    await instance.get<Page<Comment>>("/comments", {
      params: { limit: params.limit, ...(params.cursor ? { cursor: params.cursor } : {}) },
    })
  ).data;

export const getEpigramComments = async (
  epigramId: number | string,
  params: { limit: number; cursor?: number | null }
) =>
  (
    await instance.get<Page<Comment>>(`/epigrams/${epigramId}/comments`, {
      params: { limit: params.limit, ...(params.cursor ? { cursor: params.cursor } : {}) },
    })
  ).data;

export const createComment = async (body: { epigramId: number; content: string; isPrivate: boolean }) =>
  (await instance.post<Comment>("/comments", body)).data;

export const updateComment = async (id: number, body: { content: string; isPrivate?: boolean }) =>
  (await instance.patch<Comment>(`/comments/${id}`, body)).data;

export const deleteComment = async (id: number) => {
  await instance.delete(`/comments/${id}`);
};
