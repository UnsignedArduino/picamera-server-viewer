import React from "react";

export default function NewTabLink({
  href,
  children,
}: {
  href: string;
  children: JSX.Element | string;
}): JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
