"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import EpigramForm from "@/components/EpigramForm";
import { errorMessage, EpigramDetail, EpigramInput, getEpigram, updateEpigram } from "@/api/api";
import { useRequireAuth } from "@/utils/AuthContext";

export default function EditEpigramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useRequireAuth();
  const [epigram, setEpigram] = useState<EpigramDetail | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getEpigram(id)
      .then(setEpigram)
      .catch((err) => setLoadError(errorMessage(err, "에피그램을 불러오지 못했습니다.")));
  }, [id]);

  const handleSubmit = async (input: EpigramInput) => {
    try {
      await updateEpigram(id, input);
      router.push(`/epigrams/${id}`);
    } catch (err) {
      throw new Error(errorMessage(err, "수정 내용을 저장하지 못했습니다."));
    }
  };

  const notMine = ready && epigram && user && epigram.writerId !== user.id;

  return (
    <div>
      <Header />
      {loadError && <p className="text-center text-gray-500 mt-16">{loadError}</p>}
      {notMine && <p className="text-center text-gray-500 mt-16">내가 쓴 에피그램만 수정할 수 있습니다.</p>}
      {ready && user && epigram && !notMine && (
        <EpigramForm
          title="에피그램 수정"
          submitLabel="수정 완료"
          nickname={user.nickname}
          initial={{
            content: epigram.content,
            author: epigram.author,
            referenceTitle: epigram.referenceTitle ?? "",
            referenceUrl: epigram.referenceUrl ?? "",
            tags: epigram.tags.map((t) => t.name),
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
