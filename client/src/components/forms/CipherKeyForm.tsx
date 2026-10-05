import React, { useState } from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { VisibilityIcon, VisibilityOffIcon } from "@/components/ui";

interface ICipherKeyFormProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    helperText?: string;
    disabled?: boolean;
}

export const CipherKeyForm = React.memo(function CipherKeyForm({
    value,
    onChange,
    label = "Encryption Password",
    helperText = "Keep this safe; without it, the message cannot be decrypted.",
    disabled = false
}: ICipherKeyFormProps) {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            helperText={helperText}
            disabled={disabled}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                        </InputAdornment>
                    )
                }
            }}
        />
    );
});
