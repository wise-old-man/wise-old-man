import Link from "next/link";
import Image from "next/image";
import { Container } from "~/components/Container";

import TrollImage from "../../public/img/404_troll.png";
import BackgroundImage from "../../public/img/404_background.jpg";

import ArrowRightIcon from "~/assets/arrow_right.svg";

export default function NotFound() {
  return (
    <Container className="flex h-full items-start justify-center pt-40">
      <div className="relative flex h-[23rem] w-full max-w-3xl flex-col justify-end">
        <Image
          src={TrollImage}
          alt="404 Page - In-game Troll holding a sad sign"
          className="absolute bottom-12 right-10 block md:hidden"
        />
        <div className="relative w-full overflow-hidden rounded-xl border border-gray-500 bg-black px-12 py-10 shadow-lg md:py-12">
          <Image
            fill
            alt="404 Page - In-game Trollheim Background"
            className="z-0 opacity-40"
            src={BackgroundImage}
          />
          <h1 className="relative text-h1 font-semibold text-white md:text-5xl">Uh oh!</h1>
          <h3 className="relative mt-1 text-sm text-gray-200 md:mt-3 md:text-h3">
            Wrong cave. That page could not be found.
          </h3>
          <Link
            href="/"
            prefetch
            className="relative mt-8 flex items-center gap-x-1 text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
          >
            <ArrowRightIcon className="h-5 w-5 rotate-180" />
            Go back home
          </Link>
        </div>
        <Image
          src={TrollImage}
          alt="404 Page - In-game Troll holding a sad sign"
          className="absolute bottom-0 right-10 hidden md:block"
        />
      </div>
    </Container>
  );
}
