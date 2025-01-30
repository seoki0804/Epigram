// File: src/app/api-test/page.tsx

"use client";

import React, { useState } from "react";
import {
  getEpigrams,
  postEpigram,
  likeEpigram,
  getComments,
  postComment,
  deleteComment,
} from "@/api/api";
import { useAuth } from "@/utils/AuthContext";

interface PostEpigramParams {
  content: string;
  author: string;
  sourceTitle?: string;
  sourceUrl?: string;
  tags?: string[];
}

interface PostCommentParams {
  epigramId: string;
  content: string;
}

const APITestPage = () => {
  const { login, logout } = useAuth(); // AuthContext에서 로그인 상태 관리
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  type APIFunction<T extends unknown[]> = (...args: T) => Promise<unknown>;

  const handleAPICall = async <T extends unknown[]>(apiFunction: APIFunction<T>, params?: T) => {
    setResponse(null);
    setError(null);
    try {
      const result = await apiFunction(...(params || ([] as unknown as T)));
      setResponse(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">API 테스트 페이지</h1>
      
      {/* Auth API */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Auth API</h2>
        <div className="space-x-4">
          <button
            className="h-10 w-36 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={() =>
              handleAPICall<[string, string]>(login, ["test@example.com", "password123"])
            }
          >
            로그인
          </button>
          <button
            className="hover:bg-red-600 h-10 w-36 rounded bg-blue-500 text-white"
            onClick={logout}
          >
            로그아웃
          </button>
        </div>
      </section>

      {/* Epigram API */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Epigram API</h2>
        <div className="space-x-4">
          <button
            className="h-10 w-36 rounded bg-green-500 text-white hover:bg-green-600"
            onClick={() => handleAPICall<[]>(getEpigrams)}
          >
            에피그램 목록 가져오기
          </button>
          <button
            className="h-10 w-36 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() =>
              handleAPICall<[PostEpigramParams]>(postEpigram, [{
                content: "새로운 에피그램",
                author: "테스트 유저",
              }])
            }
          >
            에피그램 생성
          </button>
          <button
            className="h-10 w-36 rounded bg-pink-500 text-white hover:bg-pink-600"
            onClick={() => handleAPICall<[string]>(likeEpigram, ["1"])}
          >
            에피그램 좋아요
          </button>
        </div>
      </section>

      {/* Comment API */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Comment API</h2>
        <div className="space-x-4">
          <button
            className="h-10 w-36 rounded bg-purple-500 text-white hover:bg-purple-600"
            onClick={() => handleAPICall<[]>(getComments)}
          >
            댓글 가져오기
          </button>
          <button
            className="h-10 w-36 rounded bg-indigo-500 text-white hover:bg-indigo-600"
            onClick={() =>
              handleAPICall<[PostCommentParams]>(postComment, [{
                epigramId: "1",
                content: "테스트 댓글",
              }])
            }
          >
            댓글 작성
          </button>
          <button
            className="h-10 w-36 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={() => handleAPICall<[string]>(deleteComment, ["1"])}
          >
            댓글 삭제
          </button>
        </div>
      </section>
      

      {/* 결과값 */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">결과값</h2>
        {response && (
          <pre className="overflow-auto rounded-md bg-gray-100 p-4 text-sm">{response}</pre>
        )}
        {error && <p className="text-red-500 font-semibold">❌ Error: {error}</p>}
      </section>
    </div>
  );
};

export default APITestPage;
