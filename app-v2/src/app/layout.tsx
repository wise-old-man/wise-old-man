import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import { TooltipProvider } from "~/components/Tooltip";
import { ToastManager } from "~/components/ToastManager";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Wise Old Man",
  description: "Magna proident consequat in in quis aliquip duis dolore.",
};

function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        {/* <TooltipProvider delayDuration={300}>
          <nav className="fixed left-0 right-0 top-0 z-20 h-[4rem] w-full border-b border-gray-700 bg-gray-800 shadow-lg" /> 
          <div className="relative mt-0 flex h-full">
            <nav className="z-1 fixed bottom-0 left-0 top-0 hidden h-screen w-[14rem] border-r border-gray-700 bg-gray-800 shadow-lg lg:block" />
            <main className="ml-0 h-full w-full lg:ml-[14rem]">{children}</main>
          </div>
        </TooltipProvider>
        <TailwindIndicator />
        <ToastManager /> */}
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
