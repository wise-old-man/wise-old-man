import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import { TooltipProvider } from "~/components/Tooltip";
import { ToastManager } from "~/components/ToastManager";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import "../globals.css";
import { Navigation } from "~/components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | Wise Old Man",
    default: "Wise Old Man",
  },
  description: "The Open Source Old School Runescape player progress tracker.",
};

function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <TooltipProvider delayDuration={300}>
          <Navigation>{children}</Navigation>
        </TooltipProvider>
        <TailwindIndicator />
        <ToastManager />
      </body>
    </html>
  );
}

export default RootLayout;
