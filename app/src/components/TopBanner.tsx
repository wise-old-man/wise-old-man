import { cn } from "~/utils/styling";

interface TopBannerProps {
  body: JSX.Element;
  cta?: JSX.Element;
  color?: "blue" | "yellow";
}

export function TopBanner(props: TopBannerProps) {
  const { cta, body, color = "blue" } = props;

  return (
    <div
      className={cn(
        "flex items-center gap-x-4 p-3",
        !!cta ? "justify-between" : "justify-center",
        color === "blue" && "bg-blue-600",
        color === "yellow" && "bg-yellow-600"
      )}
    >
      <span className="text-sm">{body}</span>
      {cta}
    </div>
  );
}
