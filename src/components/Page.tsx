import Header from "./Header";

/** 상단 바 + 가운데 정렬된 본문 틀 */
export default function Page({
  children,
  width = "max-w-5xl",
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <>
      <Header />
      <main className={`mx-auto w-full ${width} px-5 pb-24 pt-10 sm:px-8`}>{children}</main>
    </>
  );
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-lg font-bold text-ink sm:text-xl">{children}</h2>
      {aside}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-sub">{children}</p>;
}
