"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

import PluginButton from "../../../public/img/plugin_sync_button.png";
import PluginSettings from "../../../public/img/plugin_sync_settings.png";

export function RuneLiteSyncDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "runelite-sync";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) router.back();
      }}
    >
      <DialogContent className="custom-scroll max-h-[70vh] !max-w-[50rem] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RuneLite Sync</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-start gap-5 md:flex-row">
              <div className="md:w-[50%]">
                <p className="mt-1 text-sm">
                  The Wise Old Man plugin makes managing groups easy. With just a few clicks, group
                  leaders can synchronize their clan list with their Wise Old Man group. Syncing cross
                  references your clan members with your WOM group, then gives you the option to either
                  add new members or overwrite the whole group.
                </p>
                <p className="mt-5 text-sm">
                  To use this feature, make sure you have your plugin configured correctly. Check the
                  “Sync Clan Button” box, enter your group number/ID (you can find it in your
                  group&apos;s page URL), and your group&apos;s verification code.&nbsp;
                  <span className="font-bold">
                    The sync button will not appear if your group number and verification code are
                    incorrect.
                  </span>
                </p>
                <Image
                  src={PluginButton}
                  alt="RuneLite Plugin Sync Button"
                  className="mt-5 w-full md:mt-14"
                />
              </div>
              <Image
                src={PluginSettings}
                alt="RuneLite Plugin Settings"
                className="object-contain md:w-[50%]"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
