import React from "react";
import { FormControlLabel, Switch } from "@mui/material";

interface IToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}

export const ToggleSwitch = React.memo(function ToggleSwitch({
    checked,
    onChange,
    label,
    disabled = false
}: IToggleSwitchProps) {
    return (
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    color="primary"
                />
            }
            label={label}
        />
    );
});
