"use client";

import { code } from "@streamdown/code";
import { Streamdown, type Components } from "streamdown";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
  isInverted?: boolean;
  variant?: "chat" | "note";
}

const streamdownPlugins = { code };
const typesetComponents: Components = {
  p: ({ node: _node, ...props }) => <p {...props} />,
  h1: ({ node: _node, ...props }) => <h1 {...props} />,
  h2: ({ node: _node, ...props }) => <h2 {...props} />,
  h3: ({ node: _node, ...props }) => <h3 {...props} />,
  h4: ({ node: _node, ...props }) => <h4 {...props} />,
  h5: ({ node: _node, ...props }) => <h5 {...props} />,
  h6: ({ node: _node, ...props }) => <h6 {...props} />,
  ul: ({ node: _node, ...props }) => <ul {...props} />,
  ol: ({ node: _node, ...props }) => <ol {...props} />,
  li: ({ node: _node, ...props }) => <li {...props} />,
  blockquote: ({ node: _node, ...props }) => <blockquote {...props} />,
  table: ({ node: _node, ...props }) => (
    <div className="typeset-scroll">
      <table {...props} />
    </div>
  ),
  thead: ({ node: _node, ...props }) => <thead {...props} />,
  tbody: ({ node: _node, ...props }) => <tbody {...props} />,
  tfoot: ({ node: _node, ...props }) => <tfoot {...props} />,
  tr: ({ node: _node, ...props }) => <tr {...props} />,
  th: ({ node: _node, ...props }) => <th {...props} />,
  td: ({ node: _node, ...props }) => <td {...props} />,
  a: ({ node: _node, ...props }) => <a {...props} />,
  strong: ({ node: _node, ...props }) => <strong {...props} />,
  em: ({ node: _node, ...props }) => <em {...props} />,
  hr: ({ node: _node, ...props }) => <hr {...props} />,
};

export function MarkdownContent({
  content,
  className,
  isInverted = false,
  variant = "note",
}: MarkdownContentProps) {
  return (
    <Streamdown
      mode={variant === "chat" ? "streaming" : "static"}
      plugins={streamdownPlugins}
      components={typesetComponents}
      controls={false}
      parseIncompleteMarkdown={variant === "chat"}
      className={cn(
        // Streamdown injects a root space-y utility. The typeset-streamdown
        // adapter restores Typeset's element-specific rhythm over that utility.
        "typeset typeset-streamdown w-full min-w-0 max-w-none overflow-hidden break-words",
        variant === "chat" ? "typeset-chat" : "typeset-note",
        isInverted && "typeset-inverted",
        className,
      )}
    >
      {content}
    </Streamdown>
  );
}
