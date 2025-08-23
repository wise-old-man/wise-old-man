import Link from "next/link";

export function BirdHouseLink() {
  return (
    <Link href="/bird-house" tabIndex={-1} className="hidden">
      The bird house
    </Link>
  );
}
