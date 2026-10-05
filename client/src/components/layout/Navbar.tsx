import React from "react";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";

export const Navbar = React.memo(function Navbar() {
    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: "primary.main" }}>
            <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: 2 }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1.5 }}>
                    <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
                        STEGANOGRAPHER
                    </Link>
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button color="inherit" component={Link} href="/encode">
                        Encode
                    </Button>
                    <Button color="inherit" component={Link} href="/decode">
                        Decode
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
});
