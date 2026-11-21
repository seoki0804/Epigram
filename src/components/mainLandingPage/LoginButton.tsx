"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/AuthContext";
import styles from "./LoginButton.module.css";
import Profile from "../../../public/icons/profile.svg";

const LoginButton = () => {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  // 저장된 로그인 정보를 확인하기 전에는 버튼을 그리지 않아 깜빡임을 막는다.
  if (!ready) return <div className={styles["login-container"]} />;

  return (
    <div className={styles["login-container"]}>
      {user ? (
        <div className="flex flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <Image alt="" src={user.image || Profile} width={28} height={28} className="rounded-full" unoptimized={!!user.image} />
            <span className="hidden md:inline text-[14px] font-medium">{user.nickname}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className={styles["logout-button"]}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => router.push("/login")} className={styles["login-button"]}>
          로그인
        </button>
      )}
    </div>
  );
};

export default LoginButton;
