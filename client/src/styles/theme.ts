import { createTheme } from "@mui/material/styles";
import { pink } from "@mui/material/colors";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#1e3a5f",
            light: "#2c5282",
            dark: "#152844",
            contrastText: "#ffffff"
        },
        secondary: pink
    },
    spacing: 8,
    typography: {
        fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif"
        ].join(",")
    }
});
