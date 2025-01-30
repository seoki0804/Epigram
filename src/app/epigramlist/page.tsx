// File: src/app/epigramlist/page.tsx

"use client";

import { useEffect, useState } from "react";
import styles from "./epigramList.module.css";
import Header from "@/components/Header";
import { getEpigrams } from "@/api/api";
import { EpigramResponse } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EpigramListPage = () => {
  const [epigrams, setEpigrams] = useState<EpigramResponse[]>([]);
  const [page, setPage] = useState(1);
  const router = useRouter();

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

  return (
    <div className={styles.container}>
      <Header />
      <h2 className={styles.title}>피드</h2>
      <div className={styles.grid}>
        {epigrams.map((epigram) => (
          <div 
            key={epigram.id} 
            className={styles.epigramCard} 
            onClick={() => router.push(`/epigrams/${epigram.id}`)}
          >
            <p>{epigram.content}</p>
            {epigram.author && <span className={styles.author}>- {epigram.author}</span>}
            <div className={styles.tags}>
              {epigram.tags?.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
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
