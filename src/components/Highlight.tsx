import React from "react";

interface HighlightProps {
  text: string;
  query: string;
}

export function Highlight({ text, query }: HighlightProps) {
  if (!query || !query.trim()) {
    return <>{text}</>;
  }

  // Escape special regex characters to prevent syntax crashes
  const escapedQuery = query.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <mark
            key={idx}
            className="bg-teal-100 text-teal-950 font-medium px-0.5 rounded border-b border-teal-300 shadow-[inset_0_-2px_0_rgba(15,118,110,0.1)]"
            style={{ contentVisibility: "auto" }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
