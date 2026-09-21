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
import { cn } from "@/lib/utils";

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

export type EditorMode = "visual" | "markdown";

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
    <button
      type="button"
      // Keep the caret in the editor: mousedown would blur it before the click.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="sq-control inline-flex h-7 w-7 items-center justify-center text-[var(--text-muted)] outline-none hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)] disabled:opacity-40"
    >
      <Icon className="h-[15px] w-[15px]" strokeWidth={1.6} />
    </button>
  );
}

function Separator() {
  return <span aria-hidden="true" className="my-2 w-px shrink-0 self-stretch bg-border" />;
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
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onCommand: (command: RibbonCommand) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
};

/**
 * A two-row document ribbon. Row one handles inline marks, row two handles
 * block structure, and the tall group on the right commits or drops the draft.
 */
export function EditorRibbon({
  mode,
  onModeChange,
  onCommand,
  onSave,
  onCancel,
  isSaving,
}: EditorRibbonProps) {
  return (
    <div className="flex h-[78px] shrink-0 items-stretch gap-0 overflow-x-auto px-1">
      <div className="flex flex-col justify-between py-2">
        <div className="flex items-center">
          <RibbonButton icon={Undo2} label="Undo" onClick={() => onCommand("undo")} />
          <RibbonButton icon={Redo2} label="Redo" onClick={() => onCommand("redo")} />
        </div>
        <div className="flex items-center">
          {INLINE_COMMANDS.map(([command, icon, label]) => (
            <RibbonButton
              key={command}
              icon={icon}
              label={label}
              onClick={() => onCommand(command)}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col justify-between py-2">
        <div className="flex items-center">
          {BLOCK_COMMANDS.map(([command, icon, label]) => (
            <RibbonButton
              key={command}
              icon={icon}
              label={label}
              onClick={() => onCommand(command)}
            />
          ))}
        </div>
        <div className="flex items-center">
          {LIST_COMMANDS.map(([command, icon, label]) => (
            <RibbonButton
              key={command}
              icon={icon}
              label={label}
              onClick={() => onCommand(command)}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col justify-between py-2 pl-1">
        <span className="px-1 text-[10px] font-semibold uppercase leading-none tracking-[0.1em] text-[var(--text-faint)]">
          Surface
        </span>
        <div className="sq-control flex items-center gap-0.5 bg-[var(--surface-sunken)] p-0.5">
          {(["visual", "markdown"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onModeChange(value)}
              className={cn(
                "sq-control px-2 py-1 text-[11px] capitalize outline-none",
                mode === value
                  ? "bg-card text-[var(--text-strong)] shadow-[var(--shadow-control)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-strong)]",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="ml-auto flex items-stretch gap-1 pl-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="sq-control flex w-[62px] shrink-0 flex-col items-center justify-center gap-1 self-stretch border border-[color-mix(in_oklab,var(--brand),var(--text-strong)_26%)] bg-primary text-[11px] text-primary-foreground outline-none transition-[filter] hover:brightness-[1.06] disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={1.6} />
          ) : (
            <Save className="h-[18px] w-[18px]" strokeWidth={1.6} />
          )}
          {isSaving ? "Saving" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="sq-control flex w-[62px] shrink-0 flex-col items-center justify-center gap-1 self-stretch text-[11px] text-[var(--text-muted)] outline-none hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)] disabled:opacity-60"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.6} />
          Discard
        </button>
      </div>
    </div>
  );
}
