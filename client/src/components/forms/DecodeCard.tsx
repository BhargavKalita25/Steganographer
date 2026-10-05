import React, { useState } from "react";
import { Paper, Typography, Box, Stack, Alert } from "@mui/material";
import { FileUpload, NumberInput, ToggleSwitch, ActionButton } from "@/components/ui";
import { CipherKeyForm } from "./CipherKeyForm";
import { ResultCard } from "./ResultCard";
import { useAsyncOperation } from "@/hooks";
import { decodeAsync } from "@/lib";
import { IDecodeResponse } from "@/types";

export const DecodeCard = React.memo(function DecodeCard() {
    const [imageId, setImageId] = useState<string>("");
    const [bitsPerPixel, setBitsPerPixel] = useState<number>(1);
    const [useEncryption, setUseEncryption] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [result, setResult] = useState<IDecodeResponse | null>(null);

    const { isLoading, error, execute, clearError, setError } = useAsyncOperation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!imageId) {
            setError("Please upload an encoded image first.");
            return;
        }

        if (useEncryption && !password.trim()) {
            setError("Please enter the decryption password.");
            return;
        }

        const data = await execute<IDecodeResponse>((controller) =>
            decodeAsync(
                {
                    image_id: imageId,
                    config: {
                        bits_per_pixel: bitsPerPixel,
                        secret: useEncryption ? { key: password } : undefined
                    }
                },
                controller
            )
        );

        if (data) {
            setResult(data);
        }
    };

    return (
        <Box>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" fontWeight={700} color="primary" gutterBottom>
                    Extract Secret Message
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload an image that contains a hidden message and extract the underlying payload.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <FileUpload onUploaded={(id) => setImageId(id)} disabled={isLoading} />

                        <NumberInput
                            value={bitsPerPixel}
                            onChange={setBitsPerPixel}
                            min={1}
                            max={8}
                            disabled={isLoading}
                        />

                        <ToggleSwitch
                            checked={useEncryption}
                            onChange={setUseEncryption}
                            label="Message was protected with Password Encryption"
                            disabled={isLoading}
                        />

                        {useEncryption && (
                            <CipherKeyForm
                                value={password}
                                onChange={setPassword}
                                label="Decryption Password"
                                disabled={isLoading}
                            />
                        )}

                        {error && <Alert severity="error">{error}</Alert>}

                        <Box sx={{ pt: 1 }}>
                            <ActionButton
                                label="Decode Message"
                                loadingLabel="Decoding..."
                                isLoading={isLoading}
                                disabled={!imageId}
                            />
                        </Box>
                    </Stack>
                </Box>
            </Paper>

            {result && <ResultCard type="decode" message={result.message} />}
        </Box>
    );
});
