"use client";

import { useState } from "react";
import { cn } from "~/utils/styling";
import { standardizeUsername } from "~/utils/strings";
import { Label } from "../Label";
import { Button } from "../Button";
import { TextArea } from "../TextArea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemsContainer,
} from "../Combobox";

const DELIMITER_OPTIONS = [
  {
    label: "Separated by line",
    value: "\n",
  },
  {
    label: "Separated by comma",
    value: ",",
  },
  {
    label: "Separated by semicolon",
    value: ";",
  },
];

interface ImportFromFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (usernames: string[]) => void;
}

export function ImportFromFileDialog(props: ImportFromFileDialogProps) {
  const { isOpen } = props;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) props.onClose();
      }}
    >
      <DialogContent className="w-[28rem]">
        <DialogHeader>
          <DialogTitle>Import from a text file</DialogTitle>
          <DialogDescription>
            Copy / paste the contents of a file and choose what separates each username to import them.
          </DialogDescription>
        </DialogHeader>
        <ImportFromFileForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ImportFromFileForm(props: ImportFromFileDialogProps) {
  const { onSubmit } = props;

  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<string>(DELIMITER_OPTIONS[0].value);

  const usernames = input
    .split(delimiter)
    .filter((username) => standardizeUsername(username).length > 0);

  return (
    <form
      className="mt-2 flex flex-col gap-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(usernames);
      }}
    >
      <Combobox
        value={delimiter}
        onValueChanged={(val) => {
          if (!val) return;
          setDelimiter(val);
        }}
      >
        <ComboboxButton>{DELIMITER_OPTIONS.find((o) => o.value === delimiter)?.label}</ComboboxButton>
        <ComboboxContent className="z-50" align="end">
          <ComboboxItemsContainer>
            {DELIMITER_OPTIONS.map((option) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxItemsContainer>
        </ComboboxContent>
      </Combobox>
      <TextArea
        className={cn("mt-3 min-h-[12rem]", usernames.length > 1 && "border-green-400")}
        value={input}
        placeholder="The contents of your text file"
        onChange={(e) => setInput(e.target.value)}
      />
      {usernames.length > 1 && (
        <Label className="text-xs text-green-400">Found {usernames.length} players</Label>
      )}
      <Button size="lg" variant="blue" disabled={usernames.length < 2} className="mt-4 justify-center">
        Confirm
      </Button>
    </form>
  );
}
