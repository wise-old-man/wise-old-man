import { CSSProperties, PropsWithChildren } from "react";
import { cn } from "~/utils/styling";

interface ContainerProps extends PropsWithChildren {
  className?: string;
  style?: CSSProperties & Record<string, string>;
}

function Container(props: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[min(calc(100vw-1rem),var(--max-width))] px-4 py-6 sm:p-8 md:p-12",
        props.className
      )}
      style={
        props.style ?? {
          "--max-width": "80rem",
        }
      }
    >
      {props.children}
    </div>
  );
}

export { Container };
