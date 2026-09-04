import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-sm shadow-blue-600/20 hover:bg-primary-dark hover:-translate-y-px",
  secondary: "bg-white text-text-primary border border-border shadow-sm hover:border-slate-300 hover:bg-slate-50",
  danger: "bg-error text-white shadow-sm hover:brightness-95",
  ghost: "bg-transparent text-primary hover:bg-blue-50",
};
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; }
export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} />;
}
