import { onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useDebounce } from './useDebounce';

interface IPosition {
    x: number | null;
    y: number | null;
}

interface IPropsTouchMoveCallback { start: IPosition, end: IPosition }

type TTouchMoveCallback = ({ start, end }: IPropsTouchMoveCallback) => Promise<unknown> | unknown;

interface IPropsSwipe {
    debounceDuration?: number;
    touchMoveCallback: TTouchMoveCallback;
}

const DEFAULT_DURATION = 100;

const useSwipe = ({ debounceDuration = DEFAULT_DURATION, touchMoveCallback }: IPropsSwipe) => {
    const elementRef = ref<HTMLElement | null>(null);
    const startPosition = reactive<IPosition>({ x: null, y: null });
    const currentPosition = reactive<IPosition>({ x: null, y: null });
    const endPosition = reactive<IPosition>({ x: null, y: null });

    const { resetDebounce } = useDebounce(debounceDuration, () => {
        endPosition.x = currentPosition.x;
        endPosition.y = currentPosition.y;

        touchMoveCallback({ start: startPosition, end: endPosition });
    });

    const touchMoveHandler = (event: TouchEvent) => {
        currentPosition.x = event.changedTouches[0].clientX;
        currentPosition.y = event.changedTouches[0].clientY;

        if (startPosition.x === null || startPosition.y === null) {
            startPosition.x = event.changedTouches[0].clientX;
            startPosition.y = event.changedTouches[0].clientY;
        } else {
            resetDebounce();
        }
    };

    watch(elementRef, (newVal, prevVal) => {
        if (newVal && !prevVal && elementRef.value) {
            elementRef.value.addEventListener('touchmove', touchMoveHandler);
        }
    });

    onBeforeUnmount(() => {
        if (!elementRef.value) return;
        elementRef.value.removeEventListener('touchmove', touchMoveHandler);
    });

    return { elementRef };
};

export { useSwipe };
export type { IPropsTouchMoveCallback };