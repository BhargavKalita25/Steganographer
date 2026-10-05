import React from "react";
import { Box, Typography } from "@mui/material";

interface IImagePreviewProps {
    src?: string | null;
    alt?: string;
    caption?: string;
    maxHeight?: number | string;
}

export const ImagePreview = React.memo(function ImagePreview({
    src,
    alt = "Image preview",
    caption,
    maxHeight = 360
}: IImagePreviewProps) {
    if (!src) return null;

    return (
        <Box sx={{ textAlign: "center", my: 2 }}>
            <Box
                component="img"
                src={src}
                alt={alt}
                sx={{
                    maxWidth: "100%",
                    maxHeight,
                    borderRadius: 2,
                    boxShadow: 2,
                    objectFit: "contain",
                    display: "inline-block"
                }}
            />
            {caption && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {caption}
                </Typography>
            )}
        </Box>
    );
});
