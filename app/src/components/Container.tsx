import { PropsWithChildren } from "react";
import { cn } from "~/utils/styling";

function Container(props: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[calc(100vw-1rem)] px-4 py-6 sm:p-8 md:p-12 lg:max-w-7xl",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export { Container };
