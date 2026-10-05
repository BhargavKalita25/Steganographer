import React from "react";
import Head from "next/head";
import { ThemeProvider, CssBaseline, Container, Box } from "@mui/material";
import { theme } from "@/styles/theme";
import { Navbar } from "./Navbar";

interface IAppLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export const AppLayout = React.memo(function AppLayout({
    children,
    title = "Steganographer - Secure Image Steganography",
    description = "Steganographer - Secure Image Steganography platform"
}: IAppLayoutProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar />
                <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 6, flex: 1 }}>
                    {children}
                </Container>
            </Box>
        </ThemeProvider>
    );
});
