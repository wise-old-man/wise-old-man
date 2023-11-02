import Image, { StaticImageData } from "next/image";
import { formatNumber } from "@wise-old-man/utils";
import { apiClient } from "~/services/wiseoldman";
import { Button } from "~/components/Button";
import { HeroPlayerForm } from "~/components/home/HeroPlayerForm";

import GroupsChangesImage from "../../public/img/homepage_groups_changes.png";
import GroupsRankingsImage from "../../public/img/homepage_groups_rankings.png";
import GroupsInactivitySVG from "../../public/img/homepage_groups_inactivity.svg";
import GroupsDiscoveredImage from "../../public/img/homepage_groups_discovered.png";
import GroupsCompetitionsImage from "../../public/img/homepage_groups_competitions.png";

import PlayersChartSVG from "../../public/img/homepage_players_chart.svg";
import PlayersHeatmapSVG from "../../public/img/homepage_players_heatmap.svg";
import PlayersChartOverlayImage from "../../public/img/homepage_players_chart_overlay.png";
import PlayersLeaderboardSVG from "../../public/img/homepage_players_leaderboard.svg";

import WomPhatImage from "../../public/img/wom_phat.png";
import WomCharacterImage from "../../public/img/homepage_wom.png";

import HowToStep1Image from "../../public/img/homepage_howto_step1.png";
import HowToStep2Image from "../../public/img/homepage_howto_step2.png";
import HowToStep3Image from "../../public/img/homepage_howto_step3.png";

import FeaturesDiscordBack from "../../public/img/homepage_features_discord_1.png";
import FeaturesDiscordFront from "../../public/img/homepage_features_discord_2.png";

import SyncIcon from "~/assets/sync.svg";
import DoorIcon from "~/assets/door.svg";
import BellIcon from "~/assets/bell.svg";
import SearchIcon from "~/assets/search.svg";
import GithubIcon from "~/assets/github.svg";
import PatreonIcon from "~/assets/patreon.svg";
import DiscordIcon from "~/assets/discord.svg";
import BullhornIcon from "~/assets/bullhorn.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";

export default async function LandingPage() {
  return (
    <div>
      <HeroSection />
      <PlayersSection />
      <GroupsSection />
      <DiscordSection />
      <RuneliteSection />
      <HowItWorksSection />
      <CommunitySection />
    </div>
  );
}

async function HeroSection() {
  return (
    <section className="relative flex w-full items-center justify-center bg-[#10141f] py-10 md:py-0">
      <div className="absolute inset-0 mx-auto max-w-[100vw] bg-hero-gradient lg:max-w-7xl" />
      <div className="flex items-center">
        <div className="flex w-auto flex-col items-start">
          <div className="z-10 flex flex-col px-5 pb-12 pt-14 md:px-14">
            <span className="text-xs">Hi, meet the</span>
            <h1 className="my-0.5 bg-gradient-to-t from-blue-700 to-blue-500 bg-clip-text text-4xl font-bold uppercase text-transparent md:my-1 lg:text-3xl xl:text-5xl">
              Wise Old Man
            </h1>
            <p className="relative mt-2 text-body text-gray-100">
              The <span className="text-blue-400">open source</span> Old School Runescape
              <br />
              player progress tracker.
            </p>
            <HeroPlayerForm />
          </div>
        </div>
        <div className="hidden overflow-hidden pt-20 md:block">
          <Image
            src={WomCharacterImage}
            width={359}
            height={441}
            alt="Wise Old Man - In-game NPC"
            className="translate-y-[2rem]"
          />
        </div>
      </div>
      <div className="absolute -bottom-16">
        <StatsDisplay />
      </div>
    </section>
  );
}

async function StatsDisplay() {
  const stats = (await apiClient.getRequest("/stats")) as Stats;

  const playerCount = `${(stats.players / 1_000_000).toFixed(2)}m`;
  const snapshotsCount = `${(stats.snapshots / 1_000_000).toFixed(2)}m`;
  const groupsCount = `${(stats.groups / 1_000).toFixed(1)}k`.replace(".0k", "k");
  const competitionsCount = `${(stats.competitions / 1_000).toFixed(1)}k`.replace(".0k", "k");

  return (
    <div className="relative z-20 -mt-5 flex w-full items-center">
      <div className="mx-auto rounded-xl bg-gray-900 bg-gradient-to-b from-gray-500 to-gray-900 p-px">
        <div className="mx-auto flex items-center rounded-xl bg-gray-900 py-5">
          <div className="flex flex-col items-center px-6 sm:px-8">
            <span className="text-base font-bold md:text-xl">{playerCount}</span>
            <span className="mt-1 text-xs text-gray-200">Players</span>
          </div>
          <div className="h-6 w-px bg-gray-500" />
          <div className="flex flex-col items-center px-6 sm:px-8">
            <span className="text-base font-bold md:text-xl">{snapshotsCount}</span>
            <span className="mt-1 text-xs text-gray-200">Snapshots</span>
          </div>
          <div className="h-6 w-px bg-gray-500" />
          <div className="flex flex-col items-center px-6 sm:px-8">
            <span className="text-base font-bold md:text-xl">{groupsCount}</span>
            <span className="mt-1 text-xs text-gray-200">Groups</span>
          </div>
          <div className="hidden h-6 w-px bg-gray-500 xs:block" />
          <div className="hidden flex-col items-center px-6 xs:flex sm:px-8">
            <span className="text-base font-bold md:text-xl">{competitionsCount}</span>
            <span className="mt-1 text-xs text-gray-200">Competitions</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayersSection() {
  return (
    <section className="mx-auto mt-10 flex max-w-[calc(100vw-1.25rem)] flex-col items-center px-5 py-[10rem] md:px-10 lg:max-w-5xl">
      <h2 className="text-center text-xl font-bold sm:text-4xl">Track your hiscores over time</h2>
      <p className="mt-3 max-w-sm text-center text-body text-gray-200 sm:max-w-lg sm:text-lg">
        By periodically checking your hiscores, the Wise Old Man can create a historical record, this
        allows you to:
      </p>
      <div className="mt-16 grid w-full grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col items-center overflow-hidden rounded-xl border border-gray-600 bg-gradient-to-b from-[#0B1120]/50 to-gray-900 p-10 xl:overflow-visible">
          <h3 className="text-center text-xl font-medium leading-8 text-gray-100 md:text-left lg:max-w-[23rem]">
            Check your gains, all-time records and collect achievements
          </h3>
          <div className="max-w-[calc(100%-1rem)]">
            <div className="relative">
              <PlayersChartSVG width={365} height={306} className="translate-y-[2.5rem]" />
              <Image
                src={PlayersChartOverlayImage}
                width={178}
                height={72}
                alt="99 Ranged Achievement"
                className="absolute -right-[5.2rem] bottom-[3.2rem] hidden sm:block md:hidden xl:block"
              />
              {/* <div className="absolute inset-0 translate-y-[2.5rem] bg-gradient-to-b from-gray-900/0 to-gray-900/80" /> */}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-5">
          <div className="flex grow flex-col justify-between gap-y-7 rounded-xl border border-gray-600 bg-gradient-to-b from-[#0B1120]/50 to-gray-900 px-10 pt-7 md:gap-y-0">
            <h3 className="mx-auto max-w-[10rem] text-center text-xl font-medium leading-8 text-gray-100">
              Visualise your in-game activity
            </h3>
            <div className="relative flex flex-col items-center">
              <PlayersHeatmapSVG width={238} height={68} />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 to-gray-900" />
            </div>
          </div>
          <div className="flex grow flex-col justify-between gap-y-7 rounded-xl border border-gray-600 bg-gradient-to-b from-[#0B1120]/50 to-gray-900 px-10 pt-7 md:gap-y-0">
            <h3 className="mx-auto max-w-[12rem] text-center text-xl font-medium leading-8 text-gray-100">
              Compete for ranks in the leaderboards
            </h3>
            <div className="relative flex flex-col items-center">
              <PlayersLeaderboardSVG width={238} height={108} />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 from-50% to-gray-900/80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GroupsSection() {
  return (
    <section className="mx-auto flex max-w-[calc(100vw-1.25rem)] flex-col items-center px-5 py-8 md:px-10 lg:max-w-5xl">
      <h2 className="text-center text-xl font-bold sm:text-4xl">Follow your clan&apos;s progress</h2>
      <p className="mt-3 max-w-sm text-center text-body text-gray-200 sm:max-w-lg sm:text-lg">
        By creating a group on Wise Old Man and keeping all your members updated, you are then able to:
      </p>
      <div className="mt-16 grid w-full grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex grow flex-col justify-between gap-y-7 rounded-xl border border-gray-600 bg-feature-gradient px-8 py-7 md:gap-y-0 xl:px-12">
          <h3 className="mx-auto text-center text-xl font-medium leading-8 text-gray-100 md:mb-7">
            Host group competitions
          </h3>
          <Image
            src={GroupsCompetitionsImage}
            width={1053}
            height={285}
            alt="Group Competitions"
            className="mx-auto translate-y-1"
          />
        </div>
        <div className="flex grow flex-col justify-between gap-y-7 rounded-xl border border-gray-600 bg-feature-gradient px-12 pt-7 md:gap-y-0">
          <h3 className="mx-auto text-center text-xl font-medium leading-8 text-gray-100 md:mb-7">
            Compete for clan rankings
          </h3>
          <Image
            src={GroupsRankingsImage}
            width={1041}
            height={351}
            alt="Group Rankings"
            className="mx-auto"
          />
        </div>
      </div>
      <div className="mt-5 grid w-full grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex grow flex-col justify-between gap-y-7 rounded-xl border border-gray-600 bg-feature-gradient px-8 pt-7 md:gap-y-0">
          <h3 className="mx-auto text-center text-xl font-medium leading-8 text-gray-100 md:mb-7 lg:max-w-[10rem]">
            View member list changes
          </h3>
          <Image
            src={GroupsChangesImage}
            width={647}
            height={330}
            alt="Group Member list changes"
            className="mx-auto w-full max-w-xs"
          />
        </div>
        <div className="flex grow flex-col justify-between gap-y-7 overflow-hidden rounded-xl border border-gray-600 bg-feature-gradient px-8 py-7 md:gap-y-0">
          <h3 className="mx-auto text-center text-xl font-medium leading-8 text-gray-100 md:mb-7 lg:max-w-[12rem]">
            Display member inactivity
          </h3>
          <GroupsInactivitySVG width={200} height={65} className="mx-auto" />
        </div>
        <div className="2 flex grow flex-col justify-between gap-y-7 overflow-hidden rounded-xl border border-gray-600 bg-feature-gradient px-8 pt-7 md:gap-y-0">
          <h3 className="mx-auto max-w-[16rem] text-center text-xl font-medium leading-8 text-gray-100 sm:max-w-none md:mb-7 lg:max-w-[12rem]">
            Get discovered by potential recruits
          </h3>
          <Image
            src={GroupsDiscoveredImage}
            width={753}
            height={327}
            alt="Ruthless Clan - Group card"
            className="mx-auto max-w-[18rem] translate-x-px translate-y-1"
          />
        </div>
      </div>
    </section>
  );
}

function DiscordSection() {
  return (
    <section className="mx-auto max-w-[calc(100vw-1.25rem)] px-5 py-8 md:px-10 md:py-16 lg:max-w-5xl">
      <div className="relative mt-16 flex flex-col overflow-hidden rounded-2xl border border-gray-600 bg-gray-800 px-12 pt-12 sm:overflow-visible md:flex-row md:px-16 md:pb-12 xl:max-w-5xl">
        <div className="relative z-10 flex max-w-md flex-col items-start">
          <h2 className="max-w-xs text-2xl font-semibold leading-[2.75rem] sm:text-3xl">
            Get all your clan updates on Discord
          </h2>
          <div className="mb-8 mt-7 flex flex-col gap-y-3">
            <div className="flex items-center gap-x-3">
              <Image src={WomPhatImage} alt="-" />
              <span className="text-sm text-gray-100">Updates on competitions</span>
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
          <a
            className="flex gap-x-2 rounded-full border px-4 py-2 text-xs hover:bg-white/5"
            href="https://wiseoldman.net/discord"
            target="_blank"
            rel="noopener noreferrer"
          >
            Invite Discord bot
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
        <div className="relative mx-auto mt-10 w-[388px] md:absolute md:bottom-0 md:right-16 md:mt-0">
          <Image src={FeaturesDiscordBack} alt="Wise Old Man - Discord Features" />
          <div className="absolute bottom-0 top-0 w-[388px] bg-gradient-to-t from-gray-800 to-gray-800/0" />
          <div className="absolute bottom-0 top-0 hidden w-[388px] bg-gradient-to-r from-gray-800 to-gray-800/0 md:block xl:hidden" />
          <Image
            src={FeaturesDiscordFront}
            alt="Wise Old Man - Discord Features (Overlay)"
            className="absolute -right-24 bottom-28 w-[243px]"
          />
        </div>
      </div>
    </section>
  );
}

async function RuneliteSection() {
  const pluginInstalls = await fetchRuneliteInstalls();

  return (
    <section className="mx-auto mt-10 flex max-w-[calc(100vw-1.25rem)] flex-col items-center px-5 py-[5rem] md:px-10 lg:max-w-5xl">
      <h2 className="text-center text-xl font-bold sm:text-4xl">Integrate with RuneLite</h2>
      <p className="mt-3 max-w-sm text-center text-body text-gray-200 sm:max-w-lg sm:text-lg">
        You can install our RuneLite plugin to help you integrate the Wise Old Man right into your game
        client.
      </p>
      <div className="mt-16 grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RuneliteFeatureCard
          icon={<DoorIcon className="h-5 w-5" />}
          title="Keep yourself updated"
          description="Automatically updates your WOM profile when you logout."
        />
        <RuneliteFeatureCard
          icon={<SyncIcon className="h-5 w-5" />}
          title="Sync your in-game clan"
          description="Sync your WOM members list with your in-game clan with just one click."
        />
        <RuneliteFeatureCard
          icon={<BullhornIcon className="h-5 w-5" />}
          title="Auto-submit name changes"
          description="Auto-submits name changes for your friends and clan mates."
        />
        <RuneliteFeatureCard
          icon={<BellIcon className="h-5 w-5" />}
          title="Get competition notifications"
          description="Widgets will inform you of any ongoing or upcoming competitions."
        />
        <RuneliteFeatureCard
          icon={<SearchIcon className="h-5 w-5" />}
          title="Lookup players"
          description="Check our another player's stats on WOM, including Efficiency metrics."
        />
        <div className="flex items-center justify-center rounded-lg border border-gray-500 p-6 text-center">
          <div>
            <span className="text-base font-medium">
              {pluginInstalls > -1 ? `+${formatNumber(pluginInstalls, true)}` : "+18k"} installs
            </span>
            <a
              className="mt-3 flex gap-x-2 rounded-full border px-4 py-2 text-xs hover:bg-white/5"
              href="https://runelite.net/plugin-hub/show/wom-utils"
              target="_blank"
              rel="noopener noreferrer"
            >
              Install plugin
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="mx-auto mt-10 flex max-w-[calc(100vw-1.25rem)] flex-col items-center bg-howto-gradient px-5 py-[5rem] md:px-10 lg:max-w-5xl">
      <h2 className="text-2xl font-bold md:text-4xl">How does it work?</h2>
      <div className="mt-16 flex max-w-2xl flex-col md:w-full">
        <div className="flex w-full gap-x-8">
          <div className="relative mt-10">
            <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 bg-gray-900 text-base">
              1
            </div>
            <div className="absolute left-[1.125rem] top-0 h-full w-px grow bg-blue-500" />
          </div>
          <HowToStep
            title="You update your profile"
            description="Request an update to your profile via the website, the RuneLite plugin or the Discord bot."
            image={HowToStep1Image}
          />
        </div>
        <div className="flex w-full gap-x-8">
          <div className="relative">
            <div className="relative z-10 mt-10 flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 bg-gray-900 text-base">
              2
            </div>
            <div className="absolute left-[1.125rem] top-0 h-full w-px grow bg-blue-500" />
          </div>
          <HowToStep
            title="We save your current stats"
            description="We'll check your hiscores page and store your current stats on our end."
            image={HowToStep2Image}
          />
        </div>
        <div className="flex w-full gap-x-8">
          <div className="relative">
            <div className="relative z-10 mt-10 flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 bg-gray-900 text-base">
              3
            </div>
            <div className="absolute left-[1.125rem] top-0 h-12 w-px grow bg-blue-500" />
          </div>
          <HowToStep
            title="We calculate your progress"
            description="Using this historical data, we can now calculate your gains, records, achievements, etc."
            image={HowToStep3Image}
          />
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="mx-auto flex max-w-[calc(100vw-1.25rem)] flex-col items-center px-10 pb-40 pt-10 lg:max-w-5xl">
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

interface HowToStepProps {
  title: string;
  description: string;
  image: StaticImageData;
}

function HowToStep(props: HowToStepProps) {
  const { title, description, image } = props;

  return (
    <div className="flex flex-col gap-x-6 gap-y-3 pb-16 md:flex-row md:items-center">
      <Image src={image} width={168} height={116} alt={title} />
      <div className="flex flex-col">
        <span className="text-lg font-semibold">{title}</span>
        <p className="mt-2 max-w-xs text-body text-gray-200">{description}</p>
      </div>
    </div>
  );
}

interface RuneliteFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function RuneliteFeatureCard(props: RuneliteFeatureCardProps) {
  const { title, description, icon } = props;

  return (
    <div className="rounded-lg border border-gray-500 bg-gray-800 p-6 shadow-md">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-gray-500">{icon}</div>
      <span className="text-base font-semibold">{title}</span>
      <p className="mt-1 text-body text-gray-200">{description}</p>
    </div>
  );
}

interface Stats {
  players: number;
  snapshots: number;
  groups: number;
  competitions: number;
}

async function fetchRuneliteInstalls() {
  const installs = await fetch(
    "https://raw.githubusercontent.com/runelite/plugin-hub/master/runelite.version"
  )
    .then((res) => res.text())
    .then((latestVersion) => fetch(`https://api.runelite.net/runelite-${latestVersion}/pluginhub`))
    .then((res) => res.json());

  return installs["wom-utils"] || -1;
}
