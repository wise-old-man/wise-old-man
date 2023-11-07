"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { cn } from "~/utils/styling";
import useChangelog from "~/hooks/useChangelog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

import LogoAlt from "~/assets/logo_alt.svg";
import TagIcon from "~/assets/tag.svg";
import CodeIcon from "~/assets/code.svg";
import CloseIcon from "~/assets/close.svg";
import ToolsIcon from "~/assets/tools.svg";
import TrophyIcon from "~/assets/trophy.svg";
import PeopleIcon from "~/assets/people.svg";
import GithubIcon from "~/assets/github.svg";
import TwitterIcon from "~/assets/twitter.svg";
import DiscordIcon from "~/assets/discord.svg";
import PatreonIcon from "~/assets/patreon.svg";
import RuneliteIcon from "~/assets/runelite.svg";
import NewspaperIcon from "~/assets/newspaper.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";
import LeaderboardsIcon from "~/assets/leaderboards.svg";

const ROUTES = [
  { label: "Leaderboards", href: "/leaderboards", icon: LeaderboardsIcon },
  { label: "Competitions", href: "/competitions", icon: TrophyIcon },
  { label: "Groups", href: "/groups", icon: PeopleIcon },
  { label: "Name changes", href: "/names", icon: TagIcon },
  { label: "Efficiency rates", href: "/ehp", icon: ToolsIcon, relatedRoutes: ["/ehb"] },
];

const EXTERNAL_LINKS = [
  {
    label: "RuneLite Plugin",
    href: "https://runelite.net/plugin-hub/show/wom-utils",
    icon: RuneliteIcon,
  },
  { label: "API Documentation", href: "https://docs.wiseoldman.net/", icon: CodeIcon },
];

const SOCIAL_LINKS = [
  { label: "Discord", href: "https://wiseoldman.net/discord", icon: DiscordIcon },
  { label: "Twitter", href: "https://twitter.com/RubenPsikoi", icon: TwitterIcon },
  { label: "Patreon", href: "https://wiseoldman.net/patreon", icon: PatreonIcon },
  { label: "Github", href: "https://wiseoldman.net/github", icon: GithubIcon },
];

interface SideNavigationProps {
  isSidebarOpen: boolean;
  onSidebarClosed: () => void;
}

function SideNavigation(props: SideNavigationProps) {
  const { isSidebarOpen, onSidebarClosed } = props;

  const pathname = usePathname();

  const currentRoute = ROUTES.find(
    (r) => pathname.startsWith(r.href) || r.relatedRoutes?.some((r) => pathname.startsWith(r))
  );

  return (
    <>
      <div className="z-1 sticky bottom-0 left-0 top-0 hidden h-screen w-64 lg:flex">
        <SideBar currentRouteHref={currentRoute?.href} onRouteSelected={onSidebarClosed} />
      </div>
      <div className="fixed bottom-0 z-10 hidden w-64 lg:block">
        <SocialLinks />
      </div>
      <Transition.Root show={isSidebarOpen} as={Fragment}>
        <HeadlessDialog onClose={() => onSidebarClosed()} className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="z-60 fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <HeadlessDialog.Panel className="w-80">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="flex h-full w-full items-start">
                    <SideBar currentRouteHref={currentRoute?.href} onRouteSelected={onSidebarClosed} />
                    <button className="ml-4 mt-6" onClick={onSidebarClosed}>
                      <CloseIcon className="h-6 w-6" />
                    </button>
                  </div>
                </Transition.Child>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </HeadlessDialog>
      </Transition.Root>
    </>
  );
}

interface SideBarProps {
  currentRouteHref: string | undefined;
  onRouteSelected: () => void;
}

function SideBar(props: SideBarProps) {
  const { currentRouteHref, onRouteSelected } = props;

  const { latestChangelog, hasUnreadChangelog, readLatestChangelog } = useChangelog();

  return (
    <nav className="custom-scroll flex h-full w-full flex-col overflow-y-auto border-r border-gray-700 bg-gray-800 shadow-lg">
      <Link
        href="/"
        aria-label="Home"
        className="block outline-none ring-0 lg:hidden"
        onClick={onRouteSelected}
      >
        <LogoAlt alt="Wise Old Man Logo" className="my-7 ml-7 w-32 shrink-0" />
      </Link>
      <ul className="mt-0 flex flex-col">
        {ROUTES.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "flex items-center px-7 py-4 text-sm font-medium text-gray-200 hover:bg-gray-700",
                currentRouteHref === link.href &&
                  "border-l-2 border-primary-500 bg-gray-700/50 px-[1.625rem] text-white hover:bg-gray-700/50"
              )}
              onClick={onRouteSelected}
            >
              <link.icon className="mr-2 h-5 w-5" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="w-[calc(100% - 1.6rem)] mx-5 my-4 h-px shrink-0 bg-gray-600" />
      <ul className="flex flex-col">
        {latestChangelog && (
          <li>
            <a
              href={latestChangelog.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => readLatestChangelog()}
              className="flex items-center px-7 py-4 text-sm font-medium text-gray-200 hover:bg-gray-700"
            >
              <div className="relative mr-2">
                <NewspaperIcon className="h-5 w-5" />
                {hasUnreadChangelog && (
                  <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary-600" />
                )}
              </div>
              Changelog
            </a>
          </li>
        )}
        {EXTERNAL_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-7 py-4 text-sm font-medium text-gray-200 hover:bg-gray-700"
            >
              <link.icon className="mr-2 h-5 w-5" />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-auto block lg:hidden">
        <SocialLinks />
      </div>
    </nav>
  );
}

function SocialLinks() {
  return (
    <div className="mx-5 mb-5 flex flex-col pt-10">
      <a
        href="https://wiseoldman.net"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex w-full items-center justify-between rounded-md border border-gray-400 bg-gray-700 px-3 py-2 text-sm font-medium text-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-600 hover:text-gray-100"
      >
        Main website
        <ArrowRightIcon className="h-5 w-5" />
      </a>
      <ul className="flex justify-between">
        {SOCIAL_LINKS.map((link) => (
          <li key={link.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  aria-label={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg bg-gray-700 p-3 shadow-inner-border hover:bg-gray-600"
                >
                  <link.icon alt={link.label} className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>{link.label}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { SideNavigation };
