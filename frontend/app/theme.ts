"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#1565c0",
      dark: "#0d47a1",
      light: "#e3f2fd",
    },
    background: {
      default: "#f4f6f9",
      paper: "#ffffff",
    },
    divider: "#e1e5eb",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-roboto), Roboto, Helvetica, Arial, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        outlined: {
          borderColor: "#e1e5eb",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          whiteSpace: "nowrap",
          color: "#4a5563",
          backgroundColor: "#f8f9fb",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
