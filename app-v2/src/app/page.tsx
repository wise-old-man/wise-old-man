import Image from "next/image";
import { apiClient } from "~/services/wiseoldman";
import { Container } from "~/components/Container";
import { Button } from "~/components/Button";
import { HeroPlayerForm } from "~/components/home/HeroPlayerForm";

import GithubIcon from "~/assets/github.svg";
import PatreonIcon from "~/assets/patreon.svg";
import DiscordIcon from "~/assets/discord.svg";

import How1 from "../../public/img/how_1.png";
import How2 from "../../public/img/how_2.png";
import How3 from "../../public/img/how_3.png";

import WomPhatImage from "../../public/img/wom_phat.png";
import HeroCharacterImage from "../../public/img/homepage_character.png";
import HeroBackgroundImage from "../../public/img/homepage_background.png";

import FeaturesPlayersBack from "../../public/img/homepage_features_players_1.png";
import FeaturesPlayersFront from "../../public/img/homepage_features_players_2.png";

import FeaturesGroupsBack from "../../public/img/homepage_features_groups_1.png";
import FeaturesGroupsFront from "../../public/img/homepage_features_groups_2.png";

import FeaturesDiscordBack from "../../public/img/homepage_features_discord_1.png";
import FeaturesDiscordFront from "../../public/img/homepage_features_discord_2.png";

import FeaturesRuneliteBack from "../../public/img/homepage_features_runelite_1.png";
import FeaturesRuneliteFront from "../../public/img/homepage_features_runelite_2.png";

export default function Home() {
  return (
    <Container className="relative max-w-none !p-0">
      <HeroSection />

      <PlayersSection />
      <GroupsSection />
      <DiscordSection />
      <RuneliteDiscord />

      <HowSection />

      <div className="mx-auto my-32 h-px w-full max-w-5xl shrink-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
      <CommunitySection />
    </Container>
  );
}

interface Stats {
  players: number;
  snapshots: number;
  groups: number;
  competitions: number;
}

async function HeroSection() {
  const stats = (await apiClient.getRequest("/stats")) as Stats;

  const playerCount = `${(stats.players / 1_000_000).toFixed(2)}m`;
  const snapshotsCount = `${(stats.snapshots / 1_000_000).toFixed(2)}m`;
  const groupsCount = `${(stats.groups / 1_000).toFixed(1)}k`.replace(".0k", "k");
  const competitionsCount = `${(stats.competitions / 1_000).toFixed(1)}k`.replace(".0k", "k");

  return (
    <section className="relative w-full bg-gray-900 bg-gradient-to-b from-[#1C315F]/20 to-transparent to-80% pb-20 pt-32 md:pt-10">
      <Image
        id="wom"
        src={HeroCharacterImage}
        alt="Wise Old Man - In-game NPC"
        className="absolute left-[calc(50vw-98px)] top-5 block w-[196px] md:hidden"
      />
      {/* Hero */}
      <div className="relative mx-auto max-w-[90vw] pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl">
        <div className="rounded-2xl border border-gray-700 bg-gradient-to-b from-white/10 to-white/0 p-px">
          <div className="relative rounded-2xl bg-gray-950 bg-gradient-to-tr from-gray-900 to-blue-500/30">
            <Image
              id="draynor"
              src={HeroBackgroundImage}
              alt="Hero Background - Draynor Village, Wise Old Man's house"
              className="absolute bottom-0 right-0 h-full object-cover opacity-50 lg:max-w-[60%]"
            />

            <div className="flex w-auto flex-col items-center  md:items-start">
              <div className="z-10 flex flex-col px-14 pb-12 pt-14">
                <span className="bg-gradient-to-t from-blue-700 to-blue-500 bg-clip-text text-[2.75rem] font-bold uppercase leading-[3.5rem] text-transparent">
                  Wise Old Man
                </span>
                <p className="relative mt-2 text-body text-gray-100">
                  The <span className="text-blue-400">open source</span> Old School Runescape
                  <br />
                  player progress tracker.
                </p>
                <HeroPlayerForm />
              </div>
            </div>
          </div>
        </div>
        {/* Shadow hack */}
        <div className="absolute bottom-0 h-[292px] w-full rounded-2xl shadow-lg shadow-black/20" />
        <Image
          id="wom"
          src={HeroCharacterImage}
          alt="Wise Old Man - In-game NPC"
          className="absolute -bottom-5 right-[7%] hidden w-[292px] md:block"
        />
      </div>

      {/* Stats */}
      <div className="relative z-20 -mt-5 flex w-full items-center">
        <div className="mx-auto rounded-xl bg-gray-900 bg-gradient-to-b from-gray-500 to-gray-900 p-px">
          <div className="mx-auto flex items-center rounded-xl bg-gray-900 py-5">
            <div className="flex flex-col items-center px-6 sm:px-8">
              <span className="text-base font-bold sm:text-2xl">{playerCount}</span>
              <span className="mt-1 text-xs text-gray-200">Players</span>
            </div>
            <div className="h-6 w-px bg-gray-500" />
            <div className="flex flex-col items-center px-6 sm:px-8">
              <span className="text-base font-bold sm:text-2xl">{snapshotsCount}</span>
              <span className="mt-1 text-xs text-gray-200">Snapshots</span>
            </div>
            <div className="h-6 w-px bg-gray-500" />
            <div className="flex flex-col items-center px-6 sm:px-8">
              <span className="text-base font-bold sm:text-2xl">{groupsCount}</span>
              <span className="mt-1 text-xs text-gray-200">Groups</span>
            </div>
            <div className="h-6 w-px bg-gray-500" />
            <div className="flex flex-col items-center px-6 sm:px-8">
              <span className="text-base font-bold sm:text-2xl">{competitionsCount}</span>
              <span className="mt-1 text-xs text-gray-200">Competitions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayersSection() {
  return (
    <section className="relative mx-auto flex max-w-[90vw] rounded-2xl border border-gray-600 p-16 pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl">
      <div className="max-w-md">
        <h2 className="text-3xl font-semibold">Track your hiscores over time</h2>
        <p className="mt-4 text-sm leading-6 text-gray-200">
          By periodically checking your hiscores, the Wise Old Man can create a historical record, this
          allows you to:
        </p>
        <div className="mt-7 flex flex-col gap-y-3">
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Track gains and all-time records</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Collect achievements</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Compete in the leaderboards</span>
          </div>
        </div>
      </div>
      <div className="hidden xl:block">
        <Image
          src={FeaturesPlayersBack}
          alt="Wise Old Man - Player Features"
          className="absolute bottom-0 right-10 w-[365px]"
        />
        <div className="absolute bottom-0 right-10 top-0 w-[365px] bg-gradient-to-t from-gray-900/90 to-gray-900/0" />
        <Image
          src={FeaturesPlayersFront}
          alt="Wise Old Man - Player Features (Overlay)"
          className="absolute -right-11 bottom-[5.5rem] w-[178px]"
        />
      </div>
    </section>
  );
}

function GroupsSection() {
  return (
    <section className="relative mx-auto mt-16 flex max-w-[90vw] rounded-2xl border border-gray-600 p-16 pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl xl:justify-end">
      <div className="hidden xl:block">
        <Image
          src={FeaturesGroupsBack}
          alt="Wise Old Man - Group Features"
          className="absolute bottom-0 left-10 w-[347px]"
        />
        <div className="absolute bottom-0 left-10 top-0 w-[347px] bg-gradient-to-t from-gray-900/90 to-gray-900/0" />
        <Image
          src={FeaturesGroupsFront}
          alt="Wise Old Man - Group Features (Overlay)"
          className="bottom-30 absolute left-44 w-[307px]"
        />
      </div>
      <div className="max-w-md">
        <h2 className="text-3xl font-semibold">Track your clan&apos;s progress</h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-gray-200">
          By creating a group on Wise Old Man and keeping all your members updated, you are then able to:
        </p>
        <div className="mt-7 flex flex-col gap-y-3">
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Host group competitions</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Check for member inactivity</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Track your members&apos; name changes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscordSection() {
  return (
    <section className="relative mx-auto mt-16 max-w-[90vw] rounded-2xl border border-gray-600 p-16 pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl">
      <div className="max-w-md">
        <h2 className="text-3xl font-semibold">Integrate with Discord</h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-gray-200">
          You can invite our Discord bot to get clan updates right in your clan&apos;s Discord server.
        </p>
        <div className="mt-7 flex flex-col gap-y-3">
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Updates on ongoing / upcoming competitions</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">New member achievements</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">HCIM Deaths</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Member list changes</span>
          </div>
        </div>
      </div>
      <div className="hidden xl:block">
        <Image
          src={FeaturesDiscordBack}
          alt="Wise Old Man - Discord Features"
          className="absolute bottom-0 right-16 w-[388px]"
        />
        <div className="absolute bottom-0 right-16 top-0 w-[388px] bg-gradient-to-t from-gray-900 to-gray-900/0" />
        <Image
          src={FeaturesDiscordFront}
          alt="Wise Old Man - Discord Features (Overlay)"
          className="absolute -right-11 bottom-28 w-[243px]"
        />
      </div>
    </section>
  );
}

function RuneliteDiscord() {
  return (
    <section className="relative mx-auto mt-16 flex max-w-[90vw] rounded-2xl border border-gray-600 p-16 pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl xl:justify-end">
      <div className="hidden xl:block">
        <Image
          src={FeaturesRuneliteBack}
          alt="Wise Old Man - Runelite Features"
          className="absolute bottom-0 left-10 w-[368px]"
        />
        <div className="absolute bottom-0 left-10 top-0 w-[368px] bg-gradient-to-t from-gray-900 to-gray-900/0" />
        <Image
          src={FeaturesRuneliteFront}
          alt="Wise Old Man - Runelite Features (Overlay)"
          className="absolute bottom-4 left-8 w-[441px]"
        />
      </div>
      <div className="max-w-lg">
        <h2 className="text-3xl font-semibold">Integrate with RuneLite</h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-gray-200">
          You can install our RuneLite plugin to help you integrate the Wise Old Man right into your game
          client.
        </p>
        <div className="mt-7 flex flex-col gap-y-3">
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Auto-update your player profile on logout</span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">
              Sync your group with your in-game clan with just 1 click
            </span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">
              Auto-report name changes for all your clan members
            </span>
          </div>
          <div className="flex items-center gap-x-3">
            <Image src={WomPhatImage} alt="-" />
            <span className="text-sm text-gray-100">Ongoing / upcoming competition timers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section className="mx-auto mt-32 flex max-w-[90vw] flex-col items-center pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl">
      <h2 className="text-3xl font-semibold">How does it work?</h2>
      <div className="mt-10 w-full rounded-2xl bg-gradient-to-b from-gray-500 to-gray-800 p-px shadow-lg">
        <div className="flex w-full flex-col items-center justify-between gap-y-16 rounded-2xl bg-gray-900 py-10 xl:flex-row">
          <div className="flex w-[20rem] flex-col items-center px-16">
            <Image src={How1} className="w-[9rem]" alt="Step 1 - Update" />
            <p className="mt-6 text-center text-sm leading-6">
              Periodically request an update to your account.
            </p>
          </div>
          <div className="h-px w-full shrink-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 xl:h-[16rem] xl:w-px xl:bg-gradient-to-b" />
          <div className="flex w-[20rem] flex-col items-center px-10">
            <Image src={How2} className="w-[9rem]" alt="Step 2 - We check the hiscores" />
            <p className="mt-6 text-center text-sm leading-6">
              We&apos;ll check your hiscores and store your current stats on our end.
            </p>
          </div>
          <div className="h-px w-full shrink-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 xl:h-[16rem] xl:w-px xl:bg-gradient-to-b" />
          <div className="flex w-[20rem] flex-col items-center px-10">
            <Image src={How3} className="w-[9rem]" alt="Step 3 - We calculate gains, records, etc" />
            <p className="mt-6 text-center text-sm leading-6">
              Using this historical data, we calculate your gains, records, achievements, etc.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="mx-auto mb-40 flex max-w-[80vw] flex-col items-center pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl">
      <h2 className="text-3xl font-semibold">Community driven</h2>
      <p className="mb-10 mt-5 max-w-xl text-center leading-7 text-gray-200">
        Wise Old Man is also a free Open Source project, meaning anyone in the community can contribute
        code or ideas to add new functionality.
      </p>
      <div className="flex flex-col items-center gap-5 md:flex-row">
        <a
          aria-label="GitHub"
          href="https://wiseoldman.net/github"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>
            <GithubIcon className="-ml-2 h-4 w-4" />
            Contribute on GitHub
          </Button>
        </a>
        <a
          aria-label="Discord"
          href="https://wiseoldman.net/discord"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-discord-blue hover:bg-discord-blue-hover">
            <DiscordIcon className="-ml-2 h-4 w-4" />
            Join our Discord
          </Button>
        </a>
        <a
          aria-label="Patreon"
          href="https://wiseoldman.net/patreon"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-patreon-orange hover:bg-patreon-orange-hover">
            <PatreonIcon className="-ml-2 h-4 w-4" />
            See Patreon benefits
          </Button>
        </a>
      </div>
    </section>
  );
}
