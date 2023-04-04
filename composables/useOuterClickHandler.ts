import { onBeforeUnmount, onMounted } from 'vue';

const useOuterClickHandler = (selector: string, handler: () => unknown) => {
    const checkClickedElement = (e: Event) => {
        const clickedElement = e.target as HTMLElement;
    
        if (!clickedElement) return;
    
        const neededEl = clickedElement.closest(selector);
    
        if (!neededEl) {
            handler();
        }
    };

    onMounted(() => {
        document.addEventListener('click', checkClickedElement);
    });
    
    onBeforeUnmount(() => {
        document.removeEventListener('click', checkClickedElement);
    });
};

export { useOuterClickHandler };