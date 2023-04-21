import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import "../globals.css";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import { TooltipProvider } from "~/components/Tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wise Old Man",
  description: "Magna proident consequat in in quis aliquip duis dolore.",
};

function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <TailwindIndicator />
      </body>
    </html>
  );
}

export default RootLayout;
