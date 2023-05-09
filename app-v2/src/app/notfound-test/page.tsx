import { notFound } from "next/navigation";

export default function NotFoundTest() {
  // Always* throw a notfound error to redirect to the 404 fallback page, to test it
  if (Math.random() < 0.999999999999999999) {
    notFound();
  }

  return <div />;
}
