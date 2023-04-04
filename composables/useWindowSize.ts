import { onBeforeUnmount, onMounted, reactive } from 'vue';

const useWindowSize = () => {
    const windowSize = reactive({ width: 0, height: 0 });

    const resizeHandler = () => {
        windowSize.height = window.innerHeight;
        windowSize.width = window.innerWidth;
    };

    onMounted(() => {
        resizeHandler();
        window.addEventListener('resize', resizeHandler);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', resizeHandler);
    });

    return { windowSize };
};

export { useWindowSize };