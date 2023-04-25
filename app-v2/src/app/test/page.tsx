import Link from "next/link";
import { Suspense } from "react";

export default async function TestPage() {
  return (
    <div>
      <h1 className="mb-8 text-h1 font-bold">Testing RSCs!</h1>

      <div className="flex gap-x-4">
        <Link href="/test?number=one">One</Link>
        <Link href="/test?number=two">Two</Link>
        <Link href="/test?number=three">Three</Link>
      </div>

      <div className="mt-10">
        <Suspense fallback={<p>Loading...</p>}>
          {/* @ts-expect-error - Server Component  */}
          <DelayedServerComponent delay={1000} />
        </Suspense>

        <Suspense fallback={<p>Loading...</p>}>
          {/* @ts-expect-error - Server Component  */}
          <DelayedServerComponent delay={2000} />
        </Suspense>

        <Suspense fallback={<p>Loading...</p>}>
          {/* @ts-expect-error - Server Component  */}
          <DelayedServerComponent delay={3000} />
        </Suspense>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function DelayedServerComponent(props: { delay: number }) {
  await sleep(props.delay);

  return <div>Delaying for {props.delay} milliseconds</div>;
}
