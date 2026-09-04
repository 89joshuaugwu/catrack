import { HTMLAttributes } from "react";
export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`surface rounded-2xl p-5 sm:p-6 ${className}`} {...props} />;
}
