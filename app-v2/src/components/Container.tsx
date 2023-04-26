import { PropsWithChildren } from "react";

function Container(props: PropsWithChildren) {
  return <div className="mx-auto w-full max-w-7xl px-8 py-16 md:px-12">{props.children}</div>;
}

export { Container };
