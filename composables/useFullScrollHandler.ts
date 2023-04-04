import { uid } from 'uid';
import { onBeforeUnmount, ref, Ref, watch } from 'vue';

interface IPropsFullScroll {
    position: InsertPosition;
    containerEl: Ref<HTMLElement | null>;
    onFullScrollCallback: () => unknown;
}

const setDivElAdditionalStyles = (position: InsertPosition) => {
    if (position === 'afterbegin') {
        return 'margin-bottom: 20px;';
    }

    if (position === 'beforeend') {
        return 'margin-bottom: 10px;';
    }

    return '';
};

/**
 * Хук добавляет в scrollable контейнер элемент, на который навешено api
 * для отслеживания его видимости. При появлении элемента в области видимости
 * (или при его исчезновении оттуда) отрабатывает прокинутый внутрь хука колбэк
 */
const useFullScrollHandler = ({
    position,
    containerEl,
    onFullScrollCallback,
}: IPropsFullScroll) => {
    // Элемент-якорь, находящийся в контейнерном элементе
    const anchorEl = ref<HTMLDivElement | null>(null);
    const observer = ref<IntersectionObserver | null>(null);

    const onScrollHandler = (entries: IntersectionObserverEntry[]) => {
        if (!containerEl.value) return;

        entries.forEach((entry) => {
            if (entry.isIntersecting && onFullScrollCallback) {
                onFullScrollCallback();
            }
        });
    };

    const mountAnchorDivEl = () => {
        if (!containerEl.value) return;

        const divId = `el-${uid()}`;
        const divEl = `<div id="${divId}" style="width: 100%; ${
            setDivElAdditionalStyles(position)
        }"></div>`;
        containerEl.value.insertAdjacentHTML(position, divEl);
    
        return document.querySelector(`#${divId}`);
    };

    // Установка обсервера на нативно вставленный в DOM-контейнер якорь 
    const onContainerMount = async () => {
        const divInDOM = mountAnchorDivEl();

        if (!divInDOM) return;

        anchorEl.value = divInDOM as HTMLDivElement;

        const options = { threshold: 0.9 };
        observer.value = new IntersectionObserver(onScrollHandler, options);
        observer.value.observe(anchorEl.value);
    };

    // Запуск вставки якорного элемента по загрузке контейнерного элемента
    watch(containerEl, (value, prevVal) => {
        if (value && !prevVal) {
            onContainerMount();
        }
    });

    onBeforeUnmount(() => {
        if (observer.value && anchorEl.value) {
            observer.value.unobserve(anchorEl.value);
        }
    });
};

export { useFullScrollHandler };