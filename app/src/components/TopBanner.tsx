interface TopBannerProps {
  body: JSX.Element;
  cta?: JSX.Element;
}

export function TopBanner(props: TopBannerProps) {
  return (
    <div className="flex items-center justify-between gap-x-4 bg-primary-600 p-3">
      <span className="text-sm">{props.body}</span>
      {props.cta}
    </div>
  );
}
