import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { cn } from "~/utils/styling";
import { Footer } from "~/components/Footer";
import { Navigation } from "~/components/Navigation";
import { TooltipProvider } from "~/components/Tooltip";
import { ToastManager } from "~/components/ToastManager";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import { ReactQueryProvider } from "~/components/ReactQueryProvider";
import "../globals.css";

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
    <html lang="en" className={cn(inter.variable, "h-full")}>
      <body className="h-full bg-gray-900 text-white">
        <NextTopLoader color="#3b82f6" showSpinner={false} />
        <TooltipProvider delayDuration={300}>
          <ReactQueryProvider>
            <Navigation>
              {children}
              <Footer />
            </Navigation>
          </ReactQueryProvider>
        </TooltipProvider>
        <TailwindIndicator />
        <ToastManager />
      </body>
    </html>
  );
}

export default RootLayout;
