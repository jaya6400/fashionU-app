// src/constants/theme.ts

export const colors = {
  primary: "#723380",
  primaryDark: "#5C3364",
  secondary: "#DBD4FE",
  accent: "#808135",
  background: "#FDFDFD",
  backgroundAlt: "#FFFFE3",
  border: "#B0ACA3",
  textSecondary: "#726164",
  white: "#FFFFFF",
  black: "#000000",
  error: "#D32F2F",
  success: "#388E3C",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  h1: 28,
  body: 16,
  bodySmall: 14,
  button: 16,
};

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};
