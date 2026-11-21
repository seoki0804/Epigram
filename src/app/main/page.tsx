"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Page, { Empty, SectionTitle } from "@/components/Page";
import EpigramCard from "@/components/EpigramCard";
import EmotionPicker from "@/components/EmotionPicker";
import CommentItem from "@/components/CommentItem";
import { Comment, Epigram, EpigramDetail, getEpigrams, getRecentComments, getTodayEpigram } from "@/api/api";
import { useRequireAuth } from "@/utils/AuthContext";

const EPIGRAM_PAGE = 5;
const COMMENT_PAGE = 4;

export default function MainPage() {
  const { user, ready } = useRequireAuth();
  const [today, setToday] = useState<EpigramDetail | null | undefined>(undefined);
  const [epigrams, setEpigrams] = useState<Epigram[] | null>(null);
  const [epiCursor, setEpiCursor] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [comCursor, setComCursor] = useState<number | null>(null);

  const loadEpigrams = useCallback(async (from: number | null) => {
    const page = await getEpigrams({ limit: EPIGRAM_PAGE, cursor: from });
    setEpigrams((prev) => (from && prev ? [...prev, ...page.list] : page.list));
    setEpiCursor(page.nextCursor);
  }, []);

  const loadComments = useCallback(async (from: number | null) => {
    const page = await getRecentComments({ limit: COMMENT_PAGE, cursor: from });
    setComments((prev) => (from && prev ? [...prev, ...page.list] : page.list));
    setComCursor(page.nextCursor);
  }, []);

  useEffect(() => {
    if (!ready) return;
    getTodayEpigram().then(setToday).catch(() => setToday(null));
    loadEpigrams(null).catch(() => setEpigrams([]));
    loadComments(null).catch(() => setComments([]));
  }, [ready, loadEpigrams, loadComments]);

  if (!ready || !user) return <Page>{null}</Page>;

  return (
    <Page width="max-w-3xl">
      <section>
        <SectionTitle>오늘의 에피그램</SectionTitle>
        {today === undefined ? (
          <div className="h-40 animate-pulse rounded-2xl bg-surface" />
        ) : today ? (
          <EpigramCard epigram={today} size="lg" />
        ) : (
          <Empty>아직 오늘의 에피그램이 없어요.</Empty>
        )}
      </section>

      <section className="mt-14">
        <SectionTitle>오늘의 감정은 어떤가요?</SectionTitle>
        <EmotionPicker userId={user.id} />
      </section>

      <section className="mt-12">
        <SectionTitle
          aside={
            <Link href="/epigramlist" className="text-sm text-sub hover:text-ink">
              피드 전체 →
            </Link>
          }
        >
          최신 에피그램
        </SectionTitle>
        {epigrams === null ? (
          <div className="h-40 animate-pulse rounded-2xl bg-surface" />
        ) : epigrams.length === 0 ? (
          <Empty>
            아직 글이 없어요.{" "}
            <Link href="/addepigram" className="font-semibold text-brand">
              첫 에피그램 쓰기
            </Link>
          </Empty>
        ) : (
          <div className="flex flex-col gap-6">
            {epigrams.map((e) => (
              <EpigramCard key={e.id} epigram={e} />
            ))}
          </div>
        )}
        {epiCursor && (
          <div className="mt-6 text-center">
            <button type="button" className="btn-ghost" onClick={() => loadEpigrams(epiCursor)}>
              에피그램 더보기
            </button>
          </div>
        )}
      </section>

      <section className="mt-14">
        <SectionTitle>최신 댓글</SectionTitle>
        {comments === null ? (
          <div className="h-32 animate-pulse rounded-2xl bg-surface" />
        ) : comments.length === 0 ? (
          <Empty>아직 댓글이 없어요.</Empty>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface px-5">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} linkToEpigram />
            ))}
          </ul>
        )}
        {comCursor && (
          <div className="mt-6 text-center">
            <button type="button" className="btn-ghost" onClick={() => loadComments(comCursor)}>
              댓글 더보기
            </button>
          </div>
        )}
      </section>
    </Page>
  );
}
