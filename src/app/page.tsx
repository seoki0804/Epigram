"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import EpigramCard from "@/components/EpigramCard";
import { Epigram, getEpigrams } from "@/api/api";
import { useAuth } from "@/utils/AuthContext";
import shot1 from "../../public/epigram_image/img_mobile_landing01.png";
import shot2 from "../../public/epigram_image/img_mobile_landing02.png";
import shot3 from "../../public/epigram_image/img_mobile_landing03.png";

const FEATURES = [
  {
    title: "명언이나 글귀, 토막 상식을 모아 두세요.",
    body: "나만 알던 문장을 저자와 출처, 태그와 함께 남기고 다른 사람과 나눕니다.",
    img: shot1,
  },
  {
    title: "오늘의 감정을 기록하고, 태그로 글을 모아 보세요.",
    body: "감동·기쁨·고민·슬픔·분노 가운데 오늘의 감정을 고르고, 같은 태그의 글을 한 번에 찾습니다.",
    img: shot2,
  },
  {
    title: "요즘 어떤 감정으로 지냈는지 한눈에 보여 드려요.",
    body: "마이페이지의 감정 달력과 감정 비율로 한 달의 마음을 돌아볼 수 있습니다.",
    img: shot3,
  },
];

export default function Landing() {
  const { user } = useAuth();
  const [latest, setLatest] = useState<Epigram[]>([]);

  useEffect(() => {
    getEpigrams({ limit: 3 })
      .then((p) => setLatest(p.list))
      .catch(() => setLatest([]));
  }, []);

  const start = user ? "/main" : "/signup";

  return (
    <>
      <Header />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.1fr_1fr] md:py-28">
          <div>
            <p className="text-sm font-semibold tracking-wide text-brand">EPIGRAM</p>
            <h1 className="mt-4 font-serif text-[32px] font-semibold leading-[1.35] text-ink sm:text-[42px]">
              나만 갖고 있기엔
              <br />
              아까운 글이 있지 않나요?
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-sub">
              명언과 글귀를 모으고, 오늘의 감정과 함께 기록하는 곳입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={start} className="btn-primary px-6 py-3 text-[15px]">
                {user ? "메인으로" : "시작하기"}
              </Link>
              <Link href="/epigramlist" className="btn-ghost px-6 py-3 text-[15px]">
                피드 둘러보기
              </Link>
            </div>
          </div>
          <div className="lined lined-lg rotate-[-1.5deg] rounded-2xl border border-line bg-surface px-8 py-9 shadow-card">
            <p className="font-serif text-xl leading-[36px] text-ink">
              고요한 바다는 결코 숙련된 뱃사람을 만들 수 없다.
            </p>
            <p className="mt-9 text-right font-serif leading-[36px] text-sub">— 영국 속담 —</p>
            <p className="text-right text-sm leading-[36px] text-faint">#바다 #도전</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
        <ul className="flex flex-col gap-16">
          {FEATURES.map((f, i) => (
            <li key={f.title} className={`flex flex-col items-center gap-8 md:flex-row ${i % 2 ? "md:flex-row-reverse" : ""}`}>
              <div className="shrink-0 rounded-3xl border border-line bg-surface p-4 shadow-card">
                <Image src={f.img} alt="" width={312} height={210} className="rounded-2xl" />
              </div>
              <div className="max-w-md">
                <h2 className="text-2xl font-bold leading-snug text-ink">{f.title}</h2>
                <p className="mt-3 leading-relaxed text-sub">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {latest.length > 0 && (
        <section className="border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
            <h2 className="text-2xl font-bold text-ink">사용자들이 남긴 에피그램</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {latest.map((e) => (
                <EpigramCard key={e.id} epigram={e} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/epigramlist" className="btn-ghost">
                더 보기
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-faint sm:px-8">
          <span className="font-serif text-sub">날마다 에피그램</span>
          <span>코드잇 Epigram API 사용</span>
        </div>
      </footer>
    </>
  );
}
