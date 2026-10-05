import React from "react";
import { TextField } from "@mui/material";

interface ITextInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    helperText?: string;
    rows?: number;
    disabled?: boolean;
    required?: boolean;
}

export const TextInput = React.memo(function TextInput({
    value,
    onChange,
    label = "Secret Message",
    placeholder = "Type your hidden message here...",
    helperText,
    rows = 4,
    disabled = false,
    required = false
}: ITextInputProps) {
    return (
        <TextField
            fullWidth
            multiline
            rows={rows}
            label={label}
            placeholder={placeholder}
            helperText={helperText}
            value={value}
            disabled={disabled}
            required={required}
            onChange={(e) => onChange(e.target.value)}
        />
    );
});
