"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Page, { Empty, SectionTitle } from "@/components/Page";
import EmotionPicker from "@/components/EmotionPicker";
import EpigramCard from "@/components/EpigramCard";
import CommentItem from "@/components/CommentItem";
import { EmotionCalendar, EmotionDonut } from "@/components/EmotionCalendar";
import { Comment, Epigram, EmotionLog, getEpigrams, getMonthlyEmotions, getUserComments } from "@/api/api";
import { useRequireAuth } from "@/utils/AuthContext";

const PAGE = 5;

export default function MyPage() {
  const { user, ready } = useRequireAuth();
  const [month, setMonth] = useState(() => new Date());
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [tab, setTab] = useState<"epigrams" | "comments">("epigrams");
  const [epigrams, setEpigrams] = useState<Epigram[]>([]);
  const [epiCursor, setEpiCursor] = useState<number | null>(null);
  const [epiTotal, setEpiTotal] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comCursor, setComCursor] = useState<number | null>(null);
  const [comTotal, setComTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const loadMonth = useCallback(async () => {
    if (!user) return;
    try {
      setLogs(await getMonthlyEmotions(user.id, month.getFullYear(), month.getMonth() + 1));
    } catch {
      setLogs([]);
    }
  }, [user, month]);

  const loadEpigrams = useCallback(
    async (from: number | null) => {
      if (!user) return;
      const page = await getEpigrams({ limit: PAGE, cursor: from, writerId: user.id });
      setEpigrams((prev) => (from ? [...prev, ...page.list] : page.list));
      setEpiCursor(page.nextCursor);
      setEpiTotal(page.totalCount);
    },
    [user]
  );

  const loadComments = useCallback(
    async (from: number | null) => {
      if (!user) return;
      const page = await getUserComments(user.id, { limit: PAGE, cursor: from });
      setComments((prev) => (from ? [...prev, ...page.list] : page.list));
      setComCursor(page.nextCursor);
      setComTotal(page.totalCount);
    },
    [user]
  );

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useEffect(() => {
    if (!ready) return;
    Promise.allSettled([loadEpigrams(null), loadComments(null)]).then(() => setLoaded(true));
  }, [ready, loadEpigrams, loadComments]);

  if (!ready || !user) return <Page>{null}</Page>;

  return (
    <Page width="max-w-3xl">
      <section className="flex flex-col items-center text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-soft text-3xl font-bold text-brand">
          {user.nickname.slice(0, 1)}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink">{user.nickname}</h1>
        <p className="mt-1 text-sm text-sub">
          에피그램 {epiTotal}개 · 댓글 {comTotal}개
        </p>
      </section>

      <section className="mt-12">
        <SectionTitle>오늘의 감정</SectionTitle>
        <EmotionPicker userId={user.id} onSaved={loadMonth} />
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <EmotionCalendar month={month} logs={logs} onMonthChange={setMonth} />
        <EmotionDonut logs={logs} />
      </section>

      <section className="mt-14">
        <div role="tablist" aria-label="내 활동" className="mb-6 flex gap-6 border-b border-line">
          {(
            [
              ["epigrams", `내 에피그램 ${epiTotal}`],
              ["comments", `내 댓글 ${comTotal}`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition ${
                tab === key ? "border-ink text-ink" : "border-transparent text-faint hover:text-sub"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!loaded ? (
          <div className="h-40 animate-pulse rounded-2xl bg-surface" />
        ) : tab === "epigrams" ? (
          epigrams.length === 0 ? (
            <Empty>
              아직 쓴 에피그램이 없어요.{" "}
              <Link href="/addepigram" className="font-semibold text-brand">
                첫 글 쓰기
              </Link>
            </Empty>
          ) : (
            <div className="flex flex-col gap-6">
              {epigrams.map((e) => (
                <EpigramCard key={e.id} epigram={e} />
              ))}
            </div>
          )
        ) : comments.length === 0 ? (
          <Empty>아직 남긴 댓글이 없어요.</Empty>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface px-5">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} linkToEpigram />
            ))}
          </ul>
        )}

        {((tab === "epigrams" && epiCursor) || (tab === "comments" && comCursor)) && (
          <div className="mt-6 text-center">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => (tab === "epigrams" ? loadEpigrams(epiCursor) : loadComments(comCursor))}
            >
              더보기
            </button>
          </div>
        )}
      </section>
    </Page>
  );
}
