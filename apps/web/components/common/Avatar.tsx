"use client";

import React from "react";
import { Avatar as AntAvatar } from "antd";
import type { AvatarProps as AntAvatarProps } from "antd";
import { getInitials } from "@/lib/utils";

/**
 * Avatar with automatic initials fallback.
 * Uses the Deep Space palette for background colors.
 *
 * When no `src` is provided, it generates initials from the `name` prop.
 */

const AVATAR_COLORS = [
  "#1a6b7a",
  "#2e5a8e",
  "#5a3e8e",
  "#8e3e6b",
  "#3e8e5a",
  "#7a6b1a",
  "#6b1a7a",
  "#1a7a4a",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

interface AvatarComponentProps extends Omit<AntAvatarProps, "children"> {
  /** Full name for initials fallback */
  name?: string;
}

export function Avatar({ name, src, style, ...props }: AvatarComponentProps) {
  if (src) {
    return <AntAvatar src={src} style={style} {...props} />;
  }

  const initials = name ? getInitials(name) : "?";
  const bgColor = name ? getColorFromName(name) : "#2e3447";

  return (
    <AntAvatar
      style={{
        backgroundColor: bgColor,
        color: "#e8eaf0",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize:
          props.size === "large" ? 18 : props.size === "small" ? 10 : 14,
        ...style,
      }}
      {...props}
    >
      {initials}
    </AntAvatar>
  );
}
