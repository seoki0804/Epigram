// File: src/app/addepigram/page.tsx
"use client";

import React, { useState } from "react";
import { postEpigram } from "@/api/api";
import { useRouter } from "next/navigation";
import styles from "./addepigram.module.css";

const AddepigramPage = () => {
  const router = useRouter();
  
  const [content, setContent] = useState("");
  const [authorType, setAuthorType] = useState("direct");
  const [author, setAuthor] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 내용 입력 핸들러 (500자 제한)
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length > 500) {
      setErrorMessage("내용은 500자 이내로 입력해주세요.");
    } else {
      setErrorMessage("");
    }
    setContent(text);
  };

  // 태그 추가 핸들러 (최대 3개, 한 태그당 10자 제한)
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = (e.target as HTMLInputElement).value.trim();
      if (newTag.length > 10) {
        setErrorMessage("태그는 최대 10자까지 입력 가능합니다.");
        return;
      }
      if (newTag && tags.length < 3) {
        setTags([...tags, newTag]);
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  // 태그 삭제 핸들러
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // 에피그램 저장 핸들러
  const handleSubmit = async () => {
    if (!content.trim()) {
      setErrorMessage("내용을 입력해주세요.");
      return;
    }
    if (content.length > 500) {
      setErrorMessage("내용은 500자 이내로 입력해주세요.");
      return;
    }
    if (authorType === "direct" && !author.trim()) {
      setErrorMessage("저자를 입력해주세요.");
      return;
    }
    
    const finalAuthor = authorType === "unknown" ? "알 수 없음" : authorType === "self" ? "본인" : author;
    
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const newEpigram = await postEpigram({
        content,
        author: finalAuthor,
        sourceTitle: sourceTitle.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        tags,
      });

      console.log("📌 저장된 에피그램 데이터:", newEpigram); // API 응답 확인

      if (newEpigram?.id) {
        router.push(`/epigrams/${newEpigram.id}`);
      } else {
        throw new Error("API 응답에 에피그램 ID가 없습니다.");
      }
    } catch (error) {
      console.error("🚨 에피그램 저장 오류:", error);
      setErrorMessage("에피그램을 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>에피그램 만들기</h1>

      {/* 내용 입력 */}
      <label className={styles.label}>내용 *</label>
      <textarea
        className={styles.textarea}
        value={content}
        onChange={handleContentChange}
        placeholder="500자 이내로 입력해주세요."
        maxLength={500}
      />
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {/* 저자 입력 */}
      <label className={styles.label}>저자 *</label>
      <div className={styles.radioGroup}>
        <label>
          <input type="radio" value="direct" checked={authorType === "direct"} onChange={() => setAuthorType("direct")} /> 직접 입력
        </label>
        <label>
          <input type="radio" value="unknown" checked={authorType === "unknown"} onChange={() => setAuthorType("unknown")} /> 알 수 없음
        </label>
        <label>
          <input type="radio" value="self" checked={authorType === "self"} onChange={() => setAuthorType("self")} /> 본인
        </label>
      </div>
      {authorType === "direct" && (
        <input
          className={styles.input}
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="저자 이름 입력"
        />
      )}

      {/* 출처 입력 */}
      <label className={styles.label}>출처</label>
      <input
        className={styles.input}
        type="text"
        value={sourceTitle}
        onChange={(e) => setSourceTitle(e.target.value)}
        placeholder="출처 제목 입력"
      />
      <input
        className={styles.input}
        type="text"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="URL (ex. https://www.website.com)"
      />
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
          출처 열기
        </a>
      )}

      {/* 태그 입력 */}
      <label className={styles.label}>태그</label>
      <input
        className={styles.input}
        type="text"
        placeholder="입력하여 태그 작성 (최대 10자)"
        onKeyDown={handleTagInput}
      />
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag} <button onClick={() => removeTag(index)}>x</button>
          </span>
        ))}
      </div>

      {/* 작성 완료 버튼 */}
      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "저장 중..." : "작성 완료"}
      </button>
    </div>
  );
};

export default AddepigramPage;