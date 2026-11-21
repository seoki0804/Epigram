"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import CommentItem from "@/components/CommentItem";
import {
  Comment,
  createComment,
  deleteComment,
  deleteEpigram,
  EpigramDetail,
  errorMessage,
  getEpigram,
  getEpigramComments,
  likeEpigram,
  unlikeEpigram,
  updateComment,
} from "@/api/api";
import { useAuth } from "@/utils/AuthContext";

const COMMENT_PAGE = 5;

export default function EpigramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [epigram, setEpigram] = useState<EpigramDetail | null>(null);
  const [loadError, setLoadError] = useState("");
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCursor, setCommentCursor] = useState<number | null>(null);
  const [commentTotal, setCommentTotal] = useState(0);
  const [draft, setDraft] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    getEpigram(id)
      .then(setEpigram)
      .catch((err) => setLoadError(errorMessage(err, "에피그램을 불러오지 못했습니다.")));
  }, [id, user]); // 로그인 상태가 바뀌면 '좋아요 눌렀는지'가 달라지므로 다시 받는다.

  const loadComments = useCallback(
    async (from: number | null) => {
      try {
        const page = await getEpigramComments(id, { limit: COMMENT_PAGE, cursor: from });
        setComments((prev) => (from ? [...prev, ...page.list] : page.list));
        setCommentCursor(page.nextCursor);
        setCommentTotal(page.totalCount);
      } catch (err) {
        setCommentError(errorMessage(err, "댓글을 불러오지 못했습니다."));
      }
    },
    [id]
  );

  useEffect(() => {
    loadComments(null);
  }, [loadComments]);

  const goLogin = () => router.push(`/login?next=${encodeURIComponent(`/epigrams/${id}`)}`);

  const toggleLike = async () => {
    if (!user) return goLogin();
    if (!epigram || liking) return;
    setLiking(true);
    try {
      setEpigram(epigram.isLiked ? await unlikeEpigram(id) : await likeEpigram(id));
    } catch (err) {
      setLoadError(errorMessage(err, "좋아요를 반영하지 못했습니다."));
    } finally {
      setLiking(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 에피그램을 삭제할까요?")) return;
    try {
      await deleteEpigram(id);
      router.push("/epigramlist");
    } catch (err) {
      setLoadError(errorMessage(err, "삭제하지 못했습니다."));
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return goLogin();
    if (!draft.trim()) return;
    setCommentError("");
    try {
      await createComment({ epigramId: Number(id), content: draft.trim(), isPrivate });
      setDraft("");
      setIsPrivate(false);
      await loadComments(null);
    } catch (err) {
      setCommentError(errorMessage(err, "댓글을 등록하지 못했습니다."));
    }
  };

  const saveEdit = async (commentId: number) => {
    if (!editDraft.trim()) return;
    try {
      const updated = await updateComment(commentId, { content: editDraft.trim() });
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
    } catch (err) {
      setCommentError(errorMessage(err, "댓글을 수정하지 못했습니다."));
    }
  };

  const removeComment = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentTotal((t) => t - 1);
    } catch (err) {
      setCommentError(errorMessage(err, "댓글을 삭제하지 못했습니다."));
    }
  };

  const isMine = !!user && !!epigram && epigram.writerId === user.id;

  return (
    <>
      <Header />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-12 sm:px-8">
          {loadError && <p className="error-text">{loadError}</p>}
          {!epigram && !loadError && <div className="h-40 animate-pulse rounded-2xl bg-paper" />}
          {epigram && (
            <article>
              <div className="flex items-start justify-between gap-4">
                <ul className="flex flex-wrap gap-2">
                  {epigram.tags.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/epigramlist?q=${encodeURIComponent(t.name)}`}
                        className="rounded-full bg-paper px-3 py-1 text-sm text-sub hover:text-ink"
                      >
                        #{t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                {isMine && (
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/epigrams/${id}/edit`} className="btn-ghost px-3 py-1.5">
                      수정
                    </Link>
                    <button type="button" onClick={handleDelete} className="btn-ghost px-3 py-1.5 text-red">
                      삭제
                    </button>
                  </div>
                )}
              </div>

              <h1 className="mt-8 whitespace-pre-line font-serif text-2xl leading-[1.6] text-ink sm:text-[28px]">
                {epigram.content}
              </h1>
              <p className="mt-6 text-right font-serif text-lg text-sub">— {epigram.author} —</p>
              {(epigram.referenceTitle || epigram.referenceUrl) && (
                <p className="mt-2 text-right text-sm text-faint">
                  출처:{" "}
                  {epigram.referenceUrl ? (
                    <a href={epigram.referenceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-sub">
                      {epigram.referenceTitle || epigram.referenceUrl}
                    </a>
                  ) : (
                    epigram.referenceTitle
                  )}
                </p>
              )}

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={toggleLike}
                  disabled={liking}
                  aria-pressed={!!epigram.isLiked}
                  className={`btn rounded-full px-5 ${epigram.isLiked ? "bg-ink text-white" : "border border-line bg-surface text-ink hover:border-faint"}`}
                >
                  {epigram.isLiked ? "♥" : "♡"} {epigram.likeCount}
                </button>
                <button type="button" onClick={copyLink} className="btn-ghost rounded-full px-5">
                  {copied ? "복사했어요" : "링크 복사"}
                </button>
              </div>
            </article>
          )}
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8">
        <h2 className="text-lg font-bold text-ink">댓글 {commentTotal}</h2>

        {user ? (
          <form onSubmit={submitComment} className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <label htmlFor="comment-draft" className="sr-only">
              댓글 입력
            </label>
            <textarea
              id="comment-draft"
              placeholder="100자 이내로 입력해 주세요."
              maxLength={100}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-faint focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-sub">
                <input
                  id="comment-private"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                비공개
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-faint">{draft.length}/100</span>
                <button type="submit" className="btn-primary px-4 py-2" disabled={!draft.trim()}>
                  등록
                </button>
              </div>
            </div>
          </form>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-line px-5 py-6 text-center text-sm text-sub">
            댓글을 쓰려면{" "}
            <Link href={`/login?next=${encodeURIComponent(`/epigrams/${id}`)}`} className="font-semibold text-brand">
              로그인
            </Link>
            해 주세요.
          </p>
        )}
        {commentError && <p className="error-text">{commentError}</p>}

        <ul className="mt-4 divide-y divide-line">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} hideContent={editingId === comment.id}>
              {editingId === comment.id ? (
                <div className="mt-3 pl-9">
                  <textarea
                    value={editDraft}
                    maxLength={100}
                    rows={2}
                    onChange={(e) => setEditDraft(e.target.value)}
                    aria-label="댓글 수정"
                    className="field resize-none"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => setEditingId(null)}>
                      취소
                    </button>
                    <button type="button" className="btn-primary px-3 py-1.5" onClick={() => saveEdit(comment.id)}>
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                user?.id === comment.writer.id && (
                  <div className="mt-1 flex justify-end gap-3 text-xs text-faint">
                    <button
                      type="button"
                      className="hover:text-ink"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditDraft(comment.content);
                      }}
                    >
                      수정
                    </button>
                    <button type="button" className="hover:text-red" onClick={() => removeComment(comment.id)}>
                      삭제
                    </button>
                  </div>
                )
              )}
            </CommentItem>
          ))}
        </ul>
        {commentCursor && (
          <div className="mt-4 text-center">
            <button type="button" className="btn-ghost" onClick={() => loadComments(commentCursor)}>
              댓글 더보기
            </button>
          </div>
        )}
      </main>
    </>
  );
}
