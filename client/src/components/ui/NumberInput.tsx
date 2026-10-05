import React from "react";
import { TextField } from "@mui/material";

interface INumberInputProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    helperText?: string;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export const NumberInput = React.memo(function NumberInput({
    value,
    onChange,
    label = "Bits Per Pixel",
    helperText = "Range: 1 (higher quality) to 8 (higher capacity)",
    min = 1,
    max = 8,
    disabled = false
}: INumberInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
            const clamped = Math.max(min, Math.min(max, val));
            onChange(clamped);
        }
    };

    return (
        <TextField
            fullWidth
            type="number"
            label={label}
            value={value}
            onChange={handleChange}
            helperText={helperText}
            disabled={disabled}
            slotProps={{
                input: {
                    inputProps: { min, max }
                }
            }}
        />
    );
});
