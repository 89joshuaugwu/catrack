import Image from "next/image";

export default function QuizShell({
  timerSlot,
  progressSlot,
  children,
}: {
  timerSlot: React.ReactNode;
  progressSlot: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="CATrack" width={28} height={28} className="rounded" />
            <span className="font-display font-semibold">CATrack</span>
          </div>
          {timerSlot}
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3 text-sm text-text-secondary">
          {progressSlot}
        </div>
      </header>
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
