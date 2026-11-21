"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EpigramForm from "@/components/EpigramForm";
import { createEpigram, errorMessage, EpigramInput } from "@/api/api";
import { useRequireAuth } from "@/utils/AuthContext";

export default function AddEpigramPage() {
  const router = useRouter();
  const { user, ready } = useRequireAuth();

  const handleSubmit = async (input: EpigramInput) => {
    try {
      const created = await createEpigram(input);
      router.push(`/epigrams/${created.id}`);
    } catch (err) {
      throw new Error(errorMessage(err, "에피그램을 저장하지 못했습니다."));
    }
  };

  return (
    <div>
      <Header />
      {ready && user && (
        <EpigramForm title="에피그램 만들기" submitLabel="작성 완료" nickname={user.nickname} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
