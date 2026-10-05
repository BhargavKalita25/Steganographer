import React, { useState } from "react";
import { Paper, Box, Typography, Button, Alert, Snackbar } from "@mui/material";
import { DownloadIcon, ContentCopyIcon } from "@/components/ui";
import { buildFileUrl } from "@/lib";

interface IResultCardProps {
    type: "encode" | "decode";
    fileId?: string;
    changes?: number;
    message?: string;
}

export const ResultCard = React.memo(function ResultCard({
    type,
    fileId,
    changes,
    message
}: IResultCardProps) {
    const [copied, setCopied] = useState<boolean>(false);

    if (type === "encode" && fileId) {
        const downloadUrl = buildFileUrl(fileId);
        return (
            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2, textAlign: "center" }}>
                <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                    Message Successfully Encoded!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {changes !== undefined && changes >= 0
                        ? `A total of ${changes} bit adjustments were embedded into the image.`
                        : "The message is now invisibly embedded in your image."}
                </Typography>

                <Box
                    component="img"
                    src={downloadUrl}
                    alt="Encoded result"
                    sx={{ maxWidth: "100%", maxHeight: 320, borderRadius: 2, my: 2, boxShadow: 2 }}
                />

                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        href={downloadUrl}
                        download={`encoded-${fileId}.png`}
                        startIcon={<DownloadIcon />}
                        sx={{ px: 4, py: 1.2, fontWeight: 600 }}
                    >
                        Download Encoded Image
                    </Button>
                </Box>
            </Paper>
        );
    }

    if (type === "decode" && message !== undefined) {
        const handleCopy = () => {
            navigator.clipboard.writeText(message);
            setCopied(true);
        };

        return (
            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
                <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                    Decoded Message
                </Typography>

                {message ? (
                    <Box
                        sx={{
                            p: 3,
                            my: 2,
                            backgroundColor: "grey.100",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "grey.300",
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontSize: "1rem"
                        }}
                    >
                        {message}
                    </Box>
                ) : (
                    <Alert severity="warning" sx={{ my: 2 }}>
                        No secret message was found or the delimiter boundaries were not reached. Make sure the
                        bits-per-pixel setting matches the one used during encoding.
                    </Alert>
                )}

                {message && (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopy}
                    >
                        Copy Message
                    </Button>
                )}

                <Snackbar
                    open={copied}
                    autoHideDuration={3000}
                    onClose={() => setCopied(false)}
                    message="Copied to clipboard!"
                />
            </Paper>
        );
    }

    return null;
});
