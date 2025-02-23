"use client";

import "@/styles/globals.css";
import Image from "next/image";
import Logo from "../../public/epigram_image/ic_epigram.svg";
import Profile from "../../public/icons/profile.svg";
import Link from "next/link";
import { useAuth } from "@/utils/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="w-full bg-[#F5F7FA] flex justify-between items-center py-4 px-8 border-b border-gray-300">
      {/* 왼쪽 로고 & 네비게이션 */}
      <div className="flex items-center gap-6">
        <Link href="/">
          <Image src={Logo} alt="로고" width={120} height={24} />
        </Link>
        <Link href="/epigramlist" className="text-gray-700 text-sm font-medium">
          피드
        </Link>
      </div>

      {/* 오른쪽 프로필 */}
      <div className="flex items-center gap-3">
        <Image src={Profile} alt="프로필 이미지" width={28} height={28} />
        <span className="text-gray-500 text-sm font-medium">
          {user?.name || "안형석"}
        </span>
      </div>
    </div>
  );
}