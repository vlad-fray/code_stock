import { Ref, ref, watch, onBeforeUnmount } from 'vue';

interface IPropsElementIntersection {
    elementRef: Ref<HTMLElement | null>;
}

const useElementIntersection = ({
    elementRef,
}: IPropsElementIntersection) => {
    const isIntersected = ref(false);
    const observer = ref<IntersectionObserver | null>(null);

    const onMountHandler = () => {
        if (!elementRef.value) return;

        const options = { rootMargin: '0px', threshold: 0.9 };

        observer.value = new IntersectionObserver(onElementIntersection, options);
        
        observer.value.observe(elementRef.value);
    };

    const onElementIntersection = (entries: IntersectionObserverEntry[]) => {       
        entries.forEach((entry) => {
            if (!elementRef.value) return;

            isIntersected.value = entry.isIntersecting;
        });
    };

    const onBeforeDestroyCallback = () => {
        if (!elementRef.value || !observer.value) return;
        observer.value.unobserve(elementRef.value);
    };

    watch(elementRef, (newVal) => {
        if (newVal) {
            onMountHandler();
        }
    });

    onBeforeUnmount(() => {
        onBeforeDestroyCallback();
    });

    return { isIntersected };
};

export { useElementIntersection };