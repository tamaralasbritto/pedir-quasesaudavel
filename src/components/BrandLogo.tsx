import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const content = (
    <span className={cn("inline-flex items-baseline gap-1.5 leading-none", className)}>
      <span className="font-display text-xl font-semibold tracking-tight text-olive-deep">
        QUASE
      </span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage text-[13px] font-bold text-olive-deep">
        !
      </span>
      <span className="font-display text-xl font-normal italic text-olive">saudável</span>
    </span>
  );
  if (!asLink) return content;
  return (
    <Link to="/" aria-label="QUASE! saudável — página inicial">
      {content}
    </Link>
  );
}
