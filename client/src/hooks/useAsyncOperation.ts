import { useState, useCallback, useRef, useEffect } from "react";
import { OperationResult } from "@/lib";

export function useAsyncOperation() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const execute = useCallback(
        async <T>(operation: (abortController: AbortController) => Promise<OperationResult<T>>): Promise<T | null> => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            setError(null);

            try {
                const result = await operation(controller);
                if (!result.isSuccessful) {
                    setError(result.errorMessage || "Operation failed.");
                    return null;
                }
                return result.data ?? null;
            } catch (err) {
                if (controller.signal.aborted) {
                    return null;
                }
                const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
                setError(msg);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        isLoading,
        error,
        execute,
        clearError,
        setError
    };
}
