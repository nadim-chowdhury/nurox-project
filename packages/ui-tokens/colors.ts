/**
 * Nurox ERP — Deep Space Color Palette
 * "The Architectural Infinite" — Liquid Precision design system
 */
export const colors = {
  // Backgrounds
  background: "#0c1324",
  surface_container_lowest: "#070d1f",
  surface_container_low: "#111827",
  surface_container: "#1a2235",
  surface_container_high: "#222c42",
  surface_container_highest: "#2e3447",

  // Primary (Electric Cyan)
  primary: "#c3f5ff",
  primary_container: "#00e5ff",
  primary_fixed_dim: "#80d8ff",

  // On-colors (text on colored surfaces)
  on_primary: "#003c4a",
  on_surface: "#e8eaf0",
  on_surface_variant: "#9aa5be",

  // Tertiary (Silver/Slate)
  tertiary: "#e3eeff",
  outline_variant: "#3d4a63",

  // Semantic
  error: "#ffb4ab",
  error_container: "#93000a",
  success: "#6dd58c",
  warning: "#ffb347",

  // Logo-derived
  brand_navy: "#1B2A4A",
  brand_slate: "#6B7FA3",
} as const;

export type ColorToken = keyof typeof colors;
