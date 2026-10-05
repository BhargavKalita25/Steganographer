import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Typography, Button, Paper, Stack, Grid } from "@mui/material";
import { LockIcon, VisibilityIcon } from "@/components/ui";

import OriginalFlowers from "../../public/images/flowers-original.jpg";
import EncodedFlowers from "../../public/images/flowers-encoded.png";

export default function HomePage() {
    return (
        <Box sx={{ py: 3 }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography
                    variant="h2"
                    component="h1"
                    fontWeight={800}
                    color="primary"
                    sx={{ letterSpacing: 2, textTransform: "uppercase" }}
                >
                    Steganographer
                </Typography>
                <Typography variant="h5" color="text.secondary" fontWeight={500} sx={{ mt: 1, mb: 3 }}>
                    Secure Image Steganography Platform
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: "auto", mb: 4, lineHeight: 1.7 }}>
                    Hide confidential messages inside everyday digital pictures without perceptible visual changes.
                    Protect your payloads with optional high-grade Fernet encryption (AES-128).
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                        component={Link}
                        href="/encode"
                        variant="contained"
                        size="large"
                        startIcon={<LockIcon />}
                        sx={{ px: 4, py: 1.4, fontWeight: 600 }}
                    >
                        Encode Message
                    </Button>
                    <Button
                        component={Link}
                        href="/decode"
                        variant="outlined"
                        size="large"
                        startIcon={<VisibilityIcon />}
                        sx={{ px: 4, py: 1.4, fontWeight: 600 }}
                    >
                        Decode Message
                    </Button>
                </Stack>
            </Box>

            <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    How It Works
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Steganography encodes information into carrier media in a manner invisible to human eyes.
                    Steganographer adjusts the least significant bits (LSB) across image color channels, making individual pixel
                    shifts imperceptible while preserving your hidden payload.
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Visual Comparison Example
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Left: Original untouched photo &bull; Right: Photo containing an embedded secret message
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <Image
                                    src={OriginalFlowers}
                                    alt="Original photograph"
                                    style={{ width: "100%", height: "auto", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    Original Image
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <Image
                                    src={EncodedFlowers}
                                    alt="Encoded photograph"
                                    style={{ width: "100%", height: "auto", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    Encoded Image (Contains Hidden Message)
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}
