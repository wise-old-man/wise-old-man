import { PropsWithChildren, useEffect, useState } from "react";

export function ClientOnly(props: PropsWithChildren) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <div>{props.children}</div>;
}
