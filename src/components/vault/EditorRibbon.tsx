"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Save,
  SquareCode,
  Strikethrough,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type RibbonCommand =
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "link"
  | "body"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "ordered"
  | "quote"
  | "codeblock"
  | "divider";

function RibbonButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      // Keep the caret in the editor: mousedown would blur it before the click.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      variant="toolbar"
      size="icon-sm"
      className="h-7 w-7"
    >
      <Icon className="h-[15px] w-[15px]" strokeWidth={1.6} />
    </Button>
  );
}

function Separator() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}

const INLINE_COMMANDS: Array<[RibbonCommand, LucideIcon, string]> = [
  ["bold", Bold, "Bold"],
  ["italic", Italic, "Italic"],
  ["strike", Strikethrough, "Strikethrough"],
  ["code", Code, "Inline code"],
  ["link", Link2, "Link"],
];

const BLOCK_COMMANDS: Array<[RibbonCommand, LucideIcon, string]> = [
  ["body", Pilcrow, "Body text"],
  ["h1", Heading1, "Heading 1"],
  ["h2", Heading2, "Heading 2"],
  ["h3", Heading3, "Heading 3"],
];

const LIST_COMMANDS: Array<[RibbonCommand, LucideIcon, string]> = [
  ["bullet", List, "Bulleted list"],
  ["ordered", ListOrdered, "Numbered list"],
  ["quote", Quote, "Quote"],
  ["codeblock", SquareCode, "Code block"],
  ["divider", Minus, "Divider"],
];

type EditorRibbonProps = {
  onCommand: (command: RibbonCommand) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
};

export function EditorRibbon({
  onCommand,
  onSave,
  onCancel,
  isSaving,
}: EditorRibbonProps) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-1 overflow-x-auto px-1.5">
      <div className="sq-control flex items-center gap-0.5 rounded-md border border-border bg-[var(--surface-sunken)] p-0.5">
        <RibbonButton icon={Undo2} label="Undo" onClick={() => onCommand("undo")} />
        <RibbonButton icon={Redo2} label="Redo" onClick={() => onCommand("redo")} />
      </div>

      <Separator />

      <div className="sq-control flex items-center gap-0.5 rounded-md border border-border bg-[var(--surface-sunken)] p-0.5">
        {INLINE_COMMANDS.map(([command, icon, label]) => (
          <RibbonButton
            key={command}
            icon={icon}
            label={label}
            onClick={() => onCommand(command)}
          />
        ))}
      </div>

      <Separator />

      <div className="sq-control flex items-center gap-0.5 rounded-md border border-border bg-[var(--surface-sunken)] p-0.5">
        {BLOCK_COMMANDS.map(([command, icon, label]) => (
          <RibbonButton
            key={command}
            icon={icon}
            label={label}
            onClick={() => onCommand(command)}
          />
        ))}
      </div>

      <Separator />

      <div className="sq-control flex items-center gap-0.5 rounded-md border border-border bg-[var(--surface-sunken)] p-0.5">
        {LIST_COMMANDS.map(([command, icon, label]) => (
          <RibbonButton
            key={command}
            icon={icon}
            label={label}
            onClick={() => onCommand(command)}
          />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5 pl-2">
        <Button type="button" onClick={onSave} disabled={isSaving} variant="default" size="sm">
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
          ) : (
            <Save className="h-3.5 w-3.5" strokeWidth={1.8} />
          )}
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" onClick={onCancel} disabled={isSaving} variant="outline" size="sm">
          <X className="h-3.5 w-3.5" strokeWidth={1.8} />
          Discard
        </Button>
      </div>
    </div>
  );
}
