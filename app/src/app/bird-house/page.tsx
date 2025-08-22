import Image from "next/image";
import { Container } from "~/components/Container";

import TrollImage from "../../../public/img/404_troll.png";

export default function BirdHousePage() {
  return (
    <Container className="flex flex-col items-center justify-center py-[5vh]">
      <Image
        src={TrollImage}
        alt="Bird-house Page - In-game Troll holding a sad sign"
        width={489}
        height={298}
      />
      <span className="text-lg text-gray-200">Wrong cave. How did you end up here?</span>
    </Container>
  );
}
