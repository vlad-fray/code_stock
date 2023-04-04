const scrollTimeoutPromise = new Promise((resolve) => {
    setTimeout(resolve, 1000 * 5);
});

const useScrollToElement = () => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    const awaitScrollToElement = async (featureElId: string) => {
        if (interval) {
            clearInterval(interval);
        }

        await Promise.race([setScrollInterval(featureElId), scrollTimeoutPromise]);
    };

    const setScrollInterval = (featureElId: string) => {
        return new Promise((resolve) => {
            interval = setInterval(() => {
                const success = tryScrollToElement(featureElId);
    
                if (interval && success) {
                    resolve(clearInterval(interval));
                }
            }, 100);
        });
    };

    const tryScrollToElement = (featureElId: string) => {
        const featureEl = document.getElementById(featureElId);

        if (!featureEl) {
            return false;
        }

        featureEl.scrollIntoView();

        return true;
    };

    return { awaitScrollToElement };
};

export { useScrollToElement };