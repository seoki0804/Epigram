"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import styles from "./epigramDetail.module.css";
import Header from "@/components/Header";
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
    <div className={styles.container}>
      <Header />

      {loadError && <p className="text-center text-gray-500 mt-10">{loadError}</p>}

      {epigram && (
        <article className={`${styles.epigramBox} mt-8`}>
          <div className={styles.tags}>
            {epigram.tags.map((tag) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
          </div>
          <div className={styles.header}>
            <h2 className="text-xl leading-relaxed whitespace-pre-line">{epigram.content}</h2>
            {isMine && (
              <div className={styles.options}>
                <button type="button" onClick={() => router.push(`/epigrams/${id}/edit`)}>
                  수정
                </button>
                <button type="button" onClick={handleDelete}>
                  삭제
                </button>
              </div>
            )}
          </div>
          <div className={styles.details}>
            <p>- {epigram.author}</p>
            {epigram.referenceUrl ? (
              <a href={epigram.referenceUrl} target="_blank" rel="noopener noreferrer">
                {epigram.referenceTitle || "출처 바로가기"}
              </a>
            ) : (
              epigram.referenceTitle && <p className="text-gray-400">{epigram.referenceTitle}</p>
            )}
          </div>
          <button
            type="button"
            className={styles.likeButton}
            onClick={toggleLike}
            disabled={liking}
            aria-pressed={!!epigram.isLiked}
          >
            {epigram.isLiked ? "♥" : "♡"} {epigram.likeCount}
          </button>
        </article>
      )}

      <section className={styles.commentSection}>
        <h3>댓글 ({commentTotal})</h3>

        {user ? (
          <form onSubmit={submitComment} className={`${styles.comment} flex flex-col gap-2`}>
            <textarea
              placeholder="100자 이내로 입력해 주세요."
              maxLength={100}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="댓글 입력"
            />
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-500 flex items-center gap-1">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                비공개
              </label>
              <button type="submit" className="text-sm px-4 py-1.5 rounded-md bg-black text-white" disabled={!draft.trim()}>
                등록
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500 my-3">
            댓글을 쓰려면{" "}
            <Link href={`/login?next=${encodeURIComponent(`/epigrams/${id}`)}`} className="underline">
              로그인
            </Link>
            해 주세요.
          </p>
        )}
        {commentError && <p className="text-sm text-red mt-2">{commentError}</p>}

        <ul className="mt-4 divide-y divide-gray-200">
          {comments.map((comment) => (
            <li key={comment.id} className={`${styles.comment} py-3`}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {comment.writer.nickname}
                  {comment.isPrivate && <span className="ml-2 text-xs text-gray-400">비공개</span>}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                </span>
              </div>
              {editingId === comment.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <textarea value={editDraft} maxLength={100} onChange={(e) => setEditDraft(e.target.value)} aria-label="댓글 수정" />
                  <div className="flex gap-2 justify-end text-sm">
                    <button type="button" onClick={() => setEditingId(null)}>취소</button>
                    <button type="button" onClick={() => saveEdit(comment.id)} className="font-medium">저장</button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-line">{comment.content}</p>
              )}
              {user?.id === comment.writer.id && editingId !== comment.id && (
                <div className="flex gap-3 justify-end text-xs text-gray-400 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditDraft(comment.content);
                    }}
                  >
                    수정
                  </button>
                  <button type="button" onClick={() => removeComment(comment.id)}>
                    삭제
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {commentCursor && (
          <button type="button" className="w-full text-sm text-gray-500 py-3" onClick={() => loadComments(commentCursor)}>
            댓글 더보기
          </button>
        )}
      </section>
    </div>
  );
}
