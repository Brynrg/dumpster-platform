import Link from "next/link";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 border border-foreground",
  secondary:
    "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 border border-black/20 dark:border-white/20",
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${variantClass[variant]} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
