"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./epigramList.module.css";
import Header from "@/components/Header";
import { deleteEpigram, Epigram, errorMessage, getEpigrams } from "@/api/api";
import { useAuth } from "@/utils/AuthContext";

const PAGE_SIZE = 6;

export default function EpigramListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [epigrams, setEpigrams] = useState<Epigram[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
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
    load(query, null);
  }, [load, query]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("이 에피그램을 삭제할까요?")) return;
    try {
      await deleteEpigram(id);
      setEpigrams((prev) => prev.filter((e) => e.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      setError(errorMessage(err, "삭제하지 못했습니다."));
    } finally {
      setOpenMenu(null);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className="flex flex-wrap items-end justify-between gap-4 mt-8">
        <h2 className={styles.title}>
          피드 <span className="text-sm font-normal text-gray-400">{total}개</span>
        </h2>
        <form
          role="search"
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(keyword.trim());
          }}
        >
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="내용·저자·태그 검색"
            aria-label="에피그램 검색"
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
          />
          <button type="submit" className="text-sm px-3 py-1.5 rounded-md bg-black text-white">
            검색
          </button>
        </form>
      </div>

      {error && <p className="text-center text-red mt-6">{error}</p>}
      {!loading && !error && epigrams.length === 0 && (
        <p className="text-center text-gray-400 my-16">
          {query ? `'${query}'에 맞는 에피그램이 없습니다.` : "아직 등록된 에피그램이 없습니다. 첫 글을 남겨 보세요."}
        </p>
      )}

      <div className={styles.grid}>
        {epigrams.map((epigram) => (
          <article key={epigram.id} className={styles.epigramCard}>
            <Link href={`/epigrams/${epigram.id}`} className="block">
              <p>{epigram.content}</p>
              <span className={styles.author}>- {epigram.author}</span>
            </Link>
            <div className={styles.tags}>
              {epigram.tags.map((tag) => (
                <span key={tag.id} className={styles.tag}>
                  #{tag.name}
                </span>
              ))}
            </div>

            {user?.id === epigram.writerId && (
              <div className={styles.optionsContainer}>
                <button
                  type="button"
                  aria-label="더보기 메뉴"
                  className={styles.optionsButton}
                  onClick={() => setOpenMenu(openMenu === epigram.id ? null : epigram.id)}
                >
                  ⋮
                </button>
                {openMenu === epigram.id && (
                  <div className={styles.dropdownMenu}>
                    <button type="button" onClick={() => router.push(`/epigrams/${epigram.id}/edit`)}>
                      수정하기
                    </button>
                    <button type="button" onClick={() => handleDelete(epigram.id)}>
                      삭제하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className={styles.buttonContainer}>
        {cursor && (
          <button
            type="button"
            onClick={() => load(query, cursor)}
            className={styles.loadMoreButton}
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "+ 에피그램 더보기"}
          </button>
        )}
        <Link href={user ? "/addepigram" : "/login?next=/addepigram"} className={styles.createButton}>
          + 에피그램 만들기
        </Link>
      </div>
    </div>
  );
}
