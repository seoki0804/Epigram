import "../styles/globals.css";
import { Noto_Serif_KR } from "next/font/google";
import { AuthProvider } from "@/utils/AuthContext";

// 명언 본문에만 쓰는 명조체. 화면 글꼴은 globals.css 의 Pretendard.
const serif = Noto_Serif_KR({
  weight: ["400", "600"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-serif",
});

export const metadata = {
  title: { default: "Epigram", template: "%s · Epigram" },
  description: "나만 갖고 있기엔 아까운 글을 나누는 곳",
  icons: { icon: "/epigram_image/ic_epigram.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
