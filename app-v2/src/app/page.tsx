import Image from "next/image";
import { fetchGlobalStats } from "~/services/wiseoldman";
import { Container } from "~/components/Container";
import { HeroPlayerForm } from "~/components/home/HeroPlayerForm";

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

export default async function Home() {
  const stats = await fetchGlobalStats();

  const playerCount = `${(stats.players / 1_000_000).toFixed(2)}m`;
  const snapshotsCount = `${(stats.snapshots / 1_000_000).toFixed(2)}m`;
  const groupsCount = `${(stats.groups / 1_000).toFixed(1)}k`.replace(".0k", "k");
  const competitionsCount = `${(stats.competitions / 1_000).toFixed(1)}k`.replace(".0k", "k");

  return (
    <Container className="relative max-w-none !p-0">
      <section className="w-full bg-gray-900 bg-gradient-to-b from-[#1C315F]/20 to-transparent pb-20 pt-6">
        {/* Hero */}
        <div className="relative mx-auto max-w-[90vw] pt-10 lg:max-w-[calc(80vw-8rem)] xl:max-w-5xl">
          <div className="rounded-2xl border border-gray-700 bg-gradient-to-b from-white/10 to-white/0 p-px">
            <div className="relative rounded-2xl bg-gray-950 bg-gradient-to-tr from-gray-900 to-blue-500/30">
              <Image
                src={HeroBackgroundImage}
                alt="Hero Background - Draynor Village, Wise Old Man's house"
                className="absolute bottom-0 right-0 h-full object-cover opacity-50 lg:max-w-[60%]"
              />

              <div className="flex w-auto flex-col items-start">
                <div className="z-10 flex flex-col px-14 pb-12 pt-14">
                  <span className="text-xs text-gray-100">Hi, meet the</span>
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
            src={HeroCharacterImage}
            alt="Wise Old Man - In-game NPC"
            className="absolute -bottom-5 right-[7%] hidden w-[292px] sm:block"
          />
        </div>

        {/* Stats */}
        <div className="relative z-20 -mt-5 hidden w-full items-center md:flex">
          <div className="mx-auto rounded-xl bg-gray-900 bg-gradient-to-b from-gray-500 to-gray-900 p-px">
            <div className="mx-auto flex items-center rounded-xl bg-gray-900 py-5">
              <div className="flex flex-col items-center px-8">
                <span className="text-2xl font-bold">{playerCount}</span>
                <span className="mt-1 text-xs text-gray-200">Players</span>
              </div>
              <div className="h-6 w-px bg-gray-500" />
              <div className="flex flex-col items-center px-8">
                <span className="text-2xl font-bold">{snapshotsCount}</span>
                <span className="mt-1 text-xs text-gray-200">Snapshots</span>
              </div>
              <div className="h-6 w-px bg-gray-500" />
              <div className="flex flex-col items-center px-8">
                <span className="text-2xl font-bold">{groupsCount}</span>
                <span className="mt-1 text-xs text-gray-200">Groups</span>
              </div>
              <div className="h-6 w-px bg-gray-500" />
              <div className="flex flex-col items-center px-8">
                <span className="text-2xl font-bold">{competitionsCount}</span>
                <span className="mt-1 text-xs text-gray-200">Competitions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto flex max-w-5xl rounded-2xl border border-gray-700 p-16">
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
      </section>

      <section className="relative mx-auto mt-24 flex max-w-5xl justify-end rounded-2xl border border-gray-700 p-16">
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
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold">Track your clan&apos;s progress</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-200">
            By creating a group on Wise Old Man and keeping all your members updated, you are then able
            to:
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

      <section className="relative mx-auto mt-24 max-w-5xl rounded-2xl border border-gray-700 p-16">
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
      </section>

      <section className="relative mx-auto mt-24 flex max-w-5xl justify-end rounded-2xl border border-gray-700 p-16">
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
        <div className="max-w-lg">
          <h2 className="text-3xl font-semibold">Integrate with RuneLite</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-200">
            You can install our RuneLite plugin to help you integrate the Wise Old Man right into your
            game client.
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
    </Container>
  );
}
