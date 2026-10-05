import React, { useState } from "react";
import { Paper, Typography, Box, Stack, Alert } from "@mui/material";
import { FileUpload, TextInput, NumberInput, ToggleSwitch, ActionButton } from "@/components/ui";
import { CipherKeyForm } from "./CipherKeyForm";
import { ResultCard } from "./ResultCard";
import { useAsyncOperation } from "@/hooks";
import { encodeAsync } from "@/lib";
import { IEncodeResponse } from "@/types";

export const EncodeCard = React.memo(function EncodeCard() {
    const [imageId, setImageId] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [bitsPerPixel, setBitsPerPixel] = useState<number>(1);
    const [useEncryption, setUseEncryption] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [result, setResult] = useState<IEncodeResponse | null>(null);

    const { isLoading, error, execute, clearError, setError } = useAsyncOperation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!imageId) {
            setError("Please upload an image first.");
            return;
        }

        if (!message.trim()) {
            setError("Please enter a message to encode.");
            return;
        }

        if (useEncryption && !password.trim()) {
            setError("Please provide a password for encryption, or disable encryption.");
            return;
        }

        const data = await execute<IEncodeResponse>((controller) =>
            encodeAsync(
                {
                    image_id: imageId,
                    message,
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
                    Encode Secret Message
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload a carrier image and enter the secret message you wish to invisibly embed.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <FileUpload onUploaded={(id) => setImageId(id)} disabled={isLoading} />

                        <TextInput
                            value={message}
                            onChange={setMessage}
                            label="Secret Message"
                            placeholder="Enter the confidential text to conceal..."
                            required
                            disabled={isLoading}
                        />

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
                            label="Protect with Password Encryption (AES-128 via Fernet)"
                            disabled={isLoading}
                        />

                        {useEncryption && (
                            <CipherKeyForm
                                value={password}
                                onChange={setPassword}
                                label="Encryption Password"
                                disabled={isLoading}
                            />
                        )}

                        {error && <Alert severity="error">{error}</Alert>}

                        <Box sx={{ pt: 1 }}>
                            <ActionButton
                                label="Encode Message"
                                loadingLabel="Encoding..."
                                isLoading={isLoading}
                                disabled={!imageId || !message.trim()}
                            />
                        </Box>
                    </Stack>
                </Box>
            </Paper>

            {result && <ResultCard type="encode" fileId={result.id} changes={result.changes} />}
        </Box>
    );
});
