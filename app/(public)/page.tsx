import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center">
      <div className="max-w-5xl w-full mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Image src="/logo.png" alt="" width={28} height={28} className="rounded" />
            <span className="font-display font-semibold">CATrack</span>
          </div>

          <h1 className="font-display text-4xl leading-tight mb-4">
            Every quiz score, added up before you leave the room.
          </h1>
          <p className="text-text-secondary text-lg mb-8 max-w-sm">
            Lecturers set the quiz and the window. Students answer and see
            their score instantly. The CA total updates itself, every time.
          </p>

          <Link
            href="/auth/login"
            className="min-h-12 px-6 inline-flex items-center rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div className="hidden md:block">
          <div className="border border-hairline rounded-lg bg-card p-6">
            <p className="text-xs text-text-secondary mb-4">CSC301 — Data Structures &amp; Algorithms</p>

            <div className="flex items-center gap-4 mb-6">
              {["A", "B", "C", "D"].map((l) => (
                <span
                  key={l}
                  className={`w-10 h-10 rounded-full border-2 grid place-items-center font-tnum text-sm font-semibold ${
                    l === "B" ? "bg-primary border-primary text-white" : "border-hairline text-text-secondary"
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>

            <div className="ledger">
              <div className="ledger-row flex items-center justify-between py-2.5 text-sm">
                <span>Arrays &amp; Linked Lists</span>
                <span className="font-tnum">4/5</span>
              </div>
              <div className="ledger-row flex items-center justify-between py-2.5 text-sm">
                <span>Trees &amp; Graphs</span>
                <span className="font-tnum">3/4</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm font-medium">
                <span>Running CA total</span>
                <span className="font-tnum">18.4 / 30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
