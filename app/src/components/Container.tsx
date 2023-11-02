import { PropsWithChildren } from "react";
import { cn } from "~/utils/styling";

function Container(props: PropsWithChildren & { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl p-6 sm:px-8 md:p-12", props.className)}>
      {props.children}
    </div>
  );
}

export { Container };
