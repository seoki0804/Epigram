"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./epigramDetail.module.css";
import Header from "@/components/Header";
import {
  getEpigramById,
  deleteEpigram,
  likeEpigram,
  postComment,
  getComments,
  deleteComment,
  updateComment,
} from "@/api/api";
import { EpigramResponse, CommentResponse } from "@/api/api";
import { useRouter, useParams } from "next/navigation";

const EpigramDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [epigram, setEpigram] = useState<EpigramResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const fetchEpigram = useCallback(async () => {
    try {
      const data = await getEpigramById(id as string);
      setEpigram(data);
    } catch (error) {
      console.error("에피그램을 불러오는데 실패했습니다.", error);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const data = await getComments(id as string);
      setComments(data);
    } catch (error) {
      console.error("댓글을 불러오는데 실패했습니다.", error);
    }
  }, [id]);

  useEffect(() => {
    fetchEpigram();
    fetchComments();
    setUserId(localStorage.getItem("userId"));
  }, [fetchEpigram, fetchComments]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteEpigram(id as string);
        router.push("/epigramlist");
      } catch (error) {
        console.error("삭제 실패", error);
      }
    }
  };

  const handleLike = async () => {
    try {
      await likeEpigram(id as string);
      fetchEpigram();
    } catch (error) {
      console.error("좋아요 실패", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await postComment({ epigramId: id as string, content: newComment });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("댓글 작성 실패", error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteComment(commentId);
        fetchComments();
      } catch (error) {
        console.error("댓글 삭제 실패", error);
      }
    }
  };

  const handleCommentEdit = async (commentId: string) => {
    if (!editedContent.trim()) return;
    try {
      await updateComment(commentId, { content: editedContent });
      setEditingComment(null);
      fetchComments();
    } catch (error) {
      console.error("댓글 수정 실패", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      {epigram && (
        <div className={styles.epigramBox}>
          <div className={styles.header}>
            <h2>{epigram.content}</h2>
            {epigram.userId === userId && (
              <div className={styles.options}>
                <button onClick={() => router.push(`/epigrams/edit/${id}`)}>수정하기</button>
                <button onClick={handleDelete}>삭제하기</button>
              </div>
            )}
          </div>
          <div className={styles.details}>
            <p>- {epigram.author}</p>
            {/* 🔹 sourceUrl → referenceUrl, sourceTitle → referenceTitle로 변경 */}
            {epigram.referenceUrl && (
              <a href={epigram.referenceUrl} target="_blank" rel="noopener noreferrer">
                출처 바로가기
              </a>
            )}
          </div>
          <div className={styles.tags}>
            {epigram.tags?.map((tag, index) => (
              <span key={index}>#{tag}</span>
            ))}
          </div>
          <button className={styles.likeButton} onClick={handleLike}>❤️ {epigram?.likes ?? 0}</button>
        </div>
      )}
      <div className={styles.commentSection}>
        <h3>댓글 ({comments.length})</h3>
        <textarea
          placeholder="100자 이내로 입력해주세요."
          maxLength={100}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleCommentSubmit}>댓글 작성</button>
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <span>{comment.username}</span>
              {editingComment === comment.id ? (
                <>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <button onClick={() => handleCommentEdit(comment.id)}>수정 완료</button>
                </>
              ) : (
                <p>{comment.content}</p>
              )}
              {comment.userId === userId && (
                <>
                  <button onClick={() => setEditingComment(comment.id)}>수정</button>
                  <button onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EpigramDetailPage;