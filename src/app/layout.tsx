import '../styles/globals.css'
import { AuthProvider } from '@/utils/AuthContext';

export const metadata = {
  title: 'Epigram',
  description: '나만 갖고 있기엔 아까운 글이 있지 않나요?.',
  icons: {
    icon: '/icons/ic_epigram.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
}
