type TDebounceCallback = () => unknown;

const useDebounce = (duration: number, callback: TDebounceCallback) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const resetDebounce = () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            callback();
        }, duration);
    };

    return { resetDebounce };
};

export { useDebounce };