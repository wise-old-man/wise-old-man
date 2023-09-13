import Image from "next/image";
import { Container } from "~/components/Container";

import TrollImage from "../../public/img/404_troll.png";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-20">
      <Image
        src={TrollImage}
        alt="404 Page - In-game Troll holding a sad sign"
        width={489}
        height={298}
      />
      <h1 className="text-[6rem] font-bold">404</h1>
      <span className="text-lg text-gray-200">Wrong cave. This page could not be found.</span>
    </Container>
  );
}
