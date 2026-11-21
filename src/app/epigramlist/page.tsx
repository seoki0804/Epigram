"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Page, { Empty } from "@/components/Page";
import EpigramCard from "@/components/EpigramCard";
import { deleteEpigram, Epigram, errorMessage, getEpigrams } from "@/api/api";
import { useAuth } from "@/utils/AuthContext";

const PAGE_SIZE = 6;

export default function FeedPage() {
  return (
    <Suspense fallback={<Page>{null}</Page>}>
      <Feed />
    </Suspense>
  );
}

function Feed() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { user } = useAuth();
  const [keyword, setKeyword] = useState(query);
  const [epigrams, setEpigrams] = useState<Epigram[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // 검색어가 바뀌면 처음부터, '더보기'면 이어서 받는다.
  const load = useCallback(async (q: string, from: number | null) => {
    setLoading(true);
    setError("");
    try {
      const page = await getEpigrams({ limit: PAGE_SIZE, cursor: from, keyword: q });
      setEpigrams((prev) => (from ? [...prev, ...page.list] : page.list));
      setCursor(page.nextCursor);
      setTotal(page.totalCount);
    } catch (err) {
      setError(errorMessage(err, "에피그램을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setKeyword(query);
    load(query, null);
  }, [load, query]);

  const handleDelete = async (id: number) => {
    setOpenMenu(null);
    if (!window.confirm("이 에피그램을 삭제할까요?")) return;
    try {
      await deleteEpigram(id);
      setEpigrams((prev) => prev.filter((e) => e.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      setError(errorMessage(err, "삭제하지 못했습니다."));
    }
  };

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">피드</h1>
          <p className="mt-1 text-sm text-sub">
            {query ? `‘${query}’ 검색 결과 ${total}개` : `모두 ${total}개의 에피그램`}
          </p>
        </div>
        <form
          role="search"
          className="flex w-full gap-2 sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const q = keyword.trim();
            router.push(q ? `/epigramlist?q=${encodeURIComponent(q)}` : "/epigramlist");
          }}
        >
          <input
            id="feed-search"
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="내용·저자·태그 검색"
            aria-label="에피그램 검색"
            className="field py-2.5 sm:w-64"
          />
          <button type="submit" className="btn-primary shrink-0">
            검색
          </button>
        </form>
      </div>

      {error && <p className="error-text mt-6">{error}</p>}

      <div className="mt-8">
        {loading && epigrams.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : epigrams.length === 0 ? (
          <Empty>
            {query ? `‘${query}’에 맞는 에피그램이 없어요.` : "아직 등록된 에피그램이 없어요. 첫 글을 남겨 보세요."}
          </Empty>
        ) : (
          <div className="grid gap-x-6 gap-y-8 md:grid-cols-2">
            {epigrams.map((epigram) => (
              <EpigramCard
                key={epigram.id}
                epigram={epigram}
                action={
                  user?.id === epigram.writerId ? (
                    <div className="relative">
                      <button
                        type="button"
                        aria-label="글 메뉴"
                        aria-expanded={openMenu === epigram.id}
                        className="grid h-8 w-8 place-items-center rounded-lg text-sub hover:bg-paper"
                        onClick={() => setOpenMenu(openMenu === epigram.id ? null : epigram.id)}
                      >
                        ⋯
                      </button>
                      {openMenu === epigram.id && (
                        <div className="absolute right-0 top-9 z-10 w-28 overflow-hidden rounded-xl border border-line bg-surface text-sm shadow-card">
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left hover:bg-paper"
                            onClick={() => router.push(`/epigrams/${epigram.id}/edit`)}
                          >
                            수정하기
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-red hover:bg-paper"
                            onClick={() => handleDelete(epigram.id)}
                          >
                            삭제하기
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </div>

      {cursor && (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => load(query, cursor)} className="btn-ghost" disabled={loading}>
            {loading ? "불러오는 중…" : "에피그램 더보기"}
          </button>
        </div>
      )}

      <Link
        href={user ? "/addepigram" : "/login?next=/addepigram"}
        className="btn-brand fixed bottom-6 right-6 z-20 rounded-full px-5 py-3.5 shadow-card sm:bottom-10 sm:right-10"
      >
        + 에피그램 만들기
      </Link>
    </Page>
  );
}
