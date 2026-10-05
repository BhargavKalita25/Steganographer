import { useState } from "react";

/**
 * Custom hook that tracks the previous value using React state during render.
 */
export function usePreviousState<T>(value: T): T | undefined {
    const [state, setState] = useState<{ current: T; previous: T | undefined }>({
        current: value,
        previous: undefined
    });

    if (state.current !== value) {
        setState({
            current: value,
            previous: state.current
        });
        return state.current;
    }

    return state.previous;
}
