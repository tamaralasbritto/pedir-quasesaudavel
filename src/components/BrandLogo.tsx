import { Link } from "@tanstack/react-router";
import logoFull from "@/assets/logo-quase-saudavel.png.asset.json";
import logoMark from "@/assets/logo-quase-mark.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  asLink = true,
  variant = "full",
}: {
  className?: string;
  asLink?: boolean;
  variant?: "full" | "mark";
}) {
  const asset = variant === "mark" ? logoMark : logoFull;
  const content = (
    <img
      src={asset.url}
      alt="QUASE! saudável"
      width={variant === "mark" ? 365 : 926}
      height={variant === "mark" ? 386 : 357}
      className={cn(variant === "mark" ? "h-8 w-auto" : "h-9 w-auto", className)}
    />
  );
  if (!asLink) return content;
  return (
    <Link to="/" aria-label="QUASE! saudável — página inicial" className="inline-flex">
      {content}
    </Link>
  );
}
