import React from "react";
import { Button, CircularProgress } from "@mui/material";

interface IActionButtonProps {
    label: string;
    loadingLabel?: string;
    isLoading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
}

export const ActionButton = React.memo(function ActionButton({
    label,
    loadingLabel,
    isLoading = false,
    disabled = false,
    onClick,
    type = "submit",
    color = "primary"
}: IActionButtonProps) {
    return (
        <Button
            type={type}
            variant="contained"
            color={color}
            size="large"
            disabled={disabled || isLoading}
            onClick={onClick}
            sx={{ minWidth: 160, py: 1.2, fontWeight: 600 }}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
            {isLoading ? loadingLabel || label : label}
        </Button>
    );
});
