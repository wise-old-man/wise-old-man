import DiscordIcon from "~/assets/discord.svg";

export default function MaintenancePagr() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-y-5">
      <p className="max-w-sm text-center text-lg text-gray-200">
        Wise Old Man is currently undergoing maintenance. Please check back later.
      </p>
      <a
        href="https://wiseoldman.net/discord"
        className="flex items-center gap-x-2 text-sm hover:underline"
      >
        Join our Discord
        <DiscordIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
