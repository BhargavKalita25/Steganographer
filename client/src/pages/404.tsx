import React from "react";
import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";

export default function Custom404() {
    return (
        <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h1" color="primary" fontWeight={800} gutterBottom>
                404
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                The page you are looking for does not exist or has been moved.
            </Typography>
            <Button component={Link} href="/" variant="contained" size="large">
                Back to Home
            </Button>
        </Box>
    );
}
