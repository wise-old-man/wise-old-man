import Link from "next/link";
import { Container } from "./Container";

import GithubIcon from "~/assets/github.svg";
import TwitterIcon from "~/assets/twitter.svg";
import DiscordIcon from "~/assets/discord.svg";
import PatreonIcon from "~/assets/patreon.svg";
import Logo from "~/assets/logo.svg";

const SOCIAL_LINKS = [
  { label: "Discord", href: "https://wiseoldman.net/discord", icon: DiscordIcon },
  { label: "Twitter", href: "https://twitter.com/RubenPsikoi", icon: TwitterIcon },
  { label: "Patreon", href: "https://wiseoldman.net/patreon", icon: PatreonIcon },
  { label: "Github", href: "https://wiseoldman.net/github", icon: GithubIcon },
];

const navigation = {
  features: [
    { name: "Leaderboards", href: "/leaderboards" },
    { name: "Competitions", href: "/competitions" },
    { name: "Groups", href: "/groups" },
    { name: "Name changes", href: "/names" },
    { name: "Efficiency rates", href: "/ehp" },
  ],
  projects: [
    { name: "Discord Bot", href: "https://bot.wiseoldman.net/" },
    { name: "RuneLite Plugin", href: "https://runelite.net/plugin-hub/show/wom-utils" },
    { name: "API Documentation", href: "https://docs.wiseoldman.net/" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <Container>
        <div className="border-t border-gray-700 pt-12 xl:grid xl:grid-cols-2 xl:gap-16">
          <div className="space-y-8 pr-8">
            <Logo alt="Wise Old Man Logo" className="w-32" />
            <p className="text-sm leading-6 text-gray-200">
              Made with care by community volunteers. Please consider contributing to the development and
              maintenance of the project on{" "}
              <a
                href="https://wiseoldman.net/patreon"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white hover:underline"
              >
                Patreon
              </a>
              .
            </p>
            <div className="flex space-x-6">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-gray-100"
                >
                  <span className="sr-only">{item.label}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Features</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.features.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="text-sm leading-6 text-gray-200 hover:text-gray-100"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Sibling projects</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.projects.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm leading-6 text-gray-200 hover:text-gray-100"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
