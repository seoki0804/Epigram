import Image from "next/image";
import Link from "next/link";
import NotFoundImg from "../../public/icons/404.svg";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Image alt="" src={NotFoundImg} width={480} height={278} className="h-auto w-full max-w-md" priority />
      <h1 className="mt-8 text-xl font-bold text-ink">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sub">주소가 바뀌었거나 삭제된 글일 수 있어요.</p>
      <Link href="/" className="btn-primary mt-8 px-6 py-3">
        홈으로 가기
      </Link>
    </main>
  );
}
