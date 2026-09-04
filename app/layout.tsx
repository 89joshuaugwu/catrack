import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CATrack — Continuous Assessment, Tracked",
  description:
    "Web-based online quiz and continuous assessment system. Lecturers create timed MCQ quizzes, students get instant auto-graded scores, running CA totals aggregate per course.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
