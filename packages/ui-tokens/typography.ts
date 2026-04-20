export const fonts = {
  display: '"Space Grotesk", sans-serif',
  body: '"Manrope", sans-serif',
};

export const typeScale = {
  "display-lg": {
    fontSize: "3.5rem",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    font: "display" as const,
  },
  "display-md": {
    fontSize: "2.5rem",
    lineHeight: 1.15,
    letterSpacing: "-0.015em",
    font: "display" as const,
  },
  "display-sm": {
    fontSize: "1.75rem",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    font: "display" as const,
  },
  "headline-lg": {
    fontSize: "1.25rem",
    lineHeight: 1.3,
    letterSpacing: "-0.005em",
    font: "display" as const,
  },
  "headline-md": {
    fontSize: "1.125rem",
    lineHeight: 1.35,
    font: "display" as const,
  },
  "body-lg": { fontSize: "1rem", lineHeight: 1.6, font: "body" as const },
  "body-md": { fontSize: "0.875rem", lineHeight: 1.55, font: "body" as const },
  "body-sm": { fontSize: "0.75rem", lineHeight: 1.5, font: "body" as const },
  "label-md": {
    fontSize: "0.75rem",
    lineHeight: 1.4,
    letterSpacing: "0.04em",
    font: "body" as const,
  },
  "label-sm": {
    fontSize: "0.6875rem",
    lineHeight: 1.4,
    letterSpacing: "0.05em",
    font: "body" as const,
  },
};
