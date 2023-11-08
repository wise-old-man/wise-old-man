import { cn } from "~/utils/styling";

interface TopBannerProps {
  body: JSX.Element;
  cta?: JSX.Element;
  className?: string;
}

export function TopBanner(props: TopBannerProps) {
  return (
    <div className={cn("flex items-center justify-between gap-x-4 bg-primary-900 p-3", props.className)}>
      <span className="text-sm">{props.body}</span>
      {props.cta}
    </div>
  );
}
