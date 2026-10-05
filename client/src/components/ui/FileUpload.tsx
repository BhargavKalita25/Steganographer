import React, { useRef, useState } from "react";
import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
import { CloudUploadIcon } from "./Icons";
import { uploadFileAsync } from "@/lib";
import { ImagePreview } from "./ImagePreview";

interface IFileUploadProps {
    onUploaded: (fileId: string) => void;
    disabled?: boolean;
}

export const FileUpload = React.memo(function FileUpload({ onUploaded, disabled = false }: IFileUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file (PNG, JPEG, etc.).");
            return;
        }

        setError(null);
        setFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file));

        setIsUploading(true);
        const result = await uploadFileAsync(file);
        setIsUploading(false);

        if (result.isSuccessful && result.data?.id) {
            onUploaded(result.data.id);
        } else {
            setError(result.errorMessage || "Failed to upload image.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled || isUploading) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    return (
        <Box sx={{ my: 2 }}>
            <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                sx={{
                    border: "2px dashed",
                    borderColor: error ? "error.main" : "primary.light",
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    cursor: disabled || isUploading ? "default" : "pointer",
                    backgroundColor: "background.paper",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        backgroundColor: disabled || isUploading ? "background.paper" : "action.hover"
                    }
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleInputChange}
                    disabled={disabled || isUploading}
                />

                {isUploading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={36} />
                        <Typography variant="body2" color="text.secondary">
                            Uploading image...
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <CloudUploadIcon size={48} color="#1976d2" />
                        <Typography variant="body1" fontWeight={500}>
                            Click or drag and drop an image here
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            PNG, JPEG, WebP supported
                        </Typography>
                        {fileName && (
                            <Typography variant="body2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
                                Selected: {fileName}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {previewUrl && <ImagePreview src={previewUrl} caption={`Preview: ${fileName}`} maxHeight={240} />}
        </Box>
    );
});
