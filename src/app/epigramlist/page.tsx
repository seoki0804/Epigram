"use client";

import { useEffect, useState } from "react";
import styles from "./epigramList.module.css";
import Header from "@/components/Header";
import { getEpigrams, deleteEpigram } from "@/api/api";
import { EpigramResponse } from "@/api/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/AuthContext";

const EpigramListPage = () => {
  const [epigrams, setEpigrams] = useState<EpigramResponse[]>([]);
  const [page, setPage] = useState(1);
  const [selectedEpigram, setSelectedEpigram] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchEpigrams();
  }, []);

  const fetchEpigrams = async () => {
    try {
      const newEpigrams: EpigramResponse[] = await getEpigrams();
      setEpigrams(newEpigrams);
    } catch (error) {
      console.error("에피그램 데이터를 불러오는데 실패했습니다.", error);
    }
  };

  const loadMoreEpigrams = async () => {
    try {
      const newEpigrams: EpigramResponse[] = await getEpigrams(page + 1);
      setEpigrams((prevEpigrams) => [...prevEpigrams, ...newEpigrams]);
      setPage(page + 1);
    } catch (error) {
      console.error("추가 에피그램을 불러오는데 실패했습니다.", error);
    }
  };

  const handleDelete = async (epigramId: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteEpigram(epigramId);
        setEpigrams((prev) => prev.filter((epigram) => epigram.id !== epigramId));
      } catch (error) {
        console.error("에피그램 삭제 실패", error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <h2 className={styles.title}>피드</h2>
      <div className={styles.grid}>
        {epigrams.map((epigram) => (
          <div key={epigram.id} className={styles.epigramCard}>
            <p onClick={() => router.push(`/epigrams/${epigram.id}`)}>
              {epigram.content}
            </p>
            {epigram.author && <span className={styles.author}>- {epigram.author}</span>}
            <div className={styles.tags}>
              {epigram.tags?.map((tag, index) => (
                <span key={index} className={styles.tag}>#{tag}</span>
              ))}
            </div>

            {/* 현재 로그인한 유저가 작성한 글에만 옵션 버튼 표시 */}
            {user?.id === epigram.userId && (
              <div className={styles.optionsContainer}>
                <button
                  className={styles.optionsButton}
                  onClick={() =>
                    setSelectedEpigram(selectedEpigram === epigram.id ? null : epigram.id)
                  }
                >
                  ⋮
                </button>
                {selectedEpigram === epigram.id && (
                  <div className={styles.dropdownMenu}>
                    <button onClick={() => router.push(`/epigrams/edit/${epigram.id}`)}>
                      수정하기
                    </button>
                    <button onClick={() => handleDelete(epigram.id)}>삭제하기</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <button onClick={loadMoreEpigrams} className={styles.loadMoreButton}>
          + 에피그램 더보기
        </button>
        <Link href="/addepigram" className={styles.createButton}>
          + 에피그램 만들기
        </Link>
      </div>
    </div>
  );
};

export default EpigramListPage;