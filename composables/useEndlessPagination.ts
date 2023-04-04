import { reactive, computed } from 'vue';

interface IPropsDefaultPagination {
    page: number;
    size: number;
}

interface IPropsAdditionalParams {
    [key: string]: unknown;
}

interface IResponseDefaultGet<T> {
    items: T[],
    total: number;
    page: number;
    size: number;
}

type TResponseDefaultGet<T> = IResponseDefaultGet<T> | null;

type TCallbackDefaultPagination<ResponseItem> = (
    props: IPropsDefaultPagination & IPropsAdditionalParams
) => Promise<TResponseDefaultGet<ResponseItem>>;

interface IPropsEndlessPagination {
    pageSize?: number;
}

interface IPaginationListObject<T> {
    [key: number]: T[];
}

interface IPagination {
    page: number;
    size: number;
    total: number;
}

const PAGE_SIZE = 12;

/** 
 * Хук для бесконечной пагинации списков 
 */
const useEndlessPagination = <ResponseItem>({
    pageSize = PAGE_SIZE,
}: IPropsEndlessPagination) => {
    const listObjItems = reactive<IPaginationListObject<ResponseItem>>({});

    let getListOfItems: TCallbackDefaultPagination<ResponseItem>;

    const pagination = reactive<IPagination>({
        page: 1,
        size: pageSize,
        total: 0,
    });

    const listItems = computed(() => {
        const pageListPairs = Object
            .entries(listObjItems) as unknown as [number, ResponseItem[]][];

        return pageListPairs
            .sort(([keyA], [keyB]) => keyA - keyB)
            .map(([, value]) => value)
            .flat();
    });

    const resetApiCallback = (callback: TCallbackDefaultPagination<ResponseItem>) => {
        getListOfItems = callback;
    };

    const resetListObj = () => {
        for (const page in listObjItems) {
            delete listObjItems[page];
        }
    };

    const getMaxUploadedPage = () => {
        const pages = Object.keys(listObjItems) as unknown as number[];
        return pages.length ? Math.max(...pages) : 0;
    };

    const getMinUploadedPage = () => {
        const pages = Object.keys(listObjItems) as unknown as number[];
        return pages.length ? Math.min(...pages) : 0;
    };

    /** Подгрузка следующей страницы */
    const loadNextPage = async (addParams?: IPropsAdditionalParams) => {
        const maxUploadedPage = getMaxUploadedPage();

        if (maxUploadedPage * pagination.size >= pagination.total) {
            return false;
        }

        const feed = await getListOfItems({
            page: maxUploadedPage + 1,
            size: pagination.size,
            ...addParams,
        });

        if (!feed) {
            return false;
        }

        listObjItems[maxUploadedPage + 1] = [...feed.items];
        pagination.total = feed.total;
        return true;
    };

    /** Подгрузка предыдущей страницы */
    const loadPrevPage = async (addParams?: IPropsAdditionalParams) => {
        const minUploadedPage = getMinUploadedPage();

        if (minUploadedPage <= 1) {
            return false;
        }

        const feed = await getListOfItems({
            page: minUploadedPage - 1,
            size: pagination.size,
            ...addParams,
        });

        if (!feed) {
            return false;
        }

        listObjItems[minUploadedPage - 1] = [...feed.items];
        pagination.total = feed.total;
        return true;
    };

    /** Сброс данных списка и их перезагрузка */
    const initPaginationControllers = async (
        callback: TCallbackDefaultPagination<ResponseItem>,
        addParams?: IPropsAdditionalParams,
    ) => {
        resetApiCallback(callback);
        resetListObj();

        const feed = await getListOfItems({
            page: pagination.page,
            size: pagination.size,
            ...addParams,
        });

        if (!feed) {
            return false;
        }

        listObjItems[pagination.page] = [...feed.items];
        pagination.total = feed.total;
        return true;
    };

    const onMountListHandler = async (
        callback: TCallbackDefaultPagination<ResponseItem>,
        addParams?: IPropsAdditionalParams,
    ) => {
        pagination.page = addParams && addParams.page && Number.isFinite(+addParams.page)
            ? +addParams.page : 1;

        initPaginationControllers(callback, addParams);
    };

    return {
        listItems,
        listObjItems,
        pagination,
        onMountListHandler,
        loadNextPage,
        loadPrevPage,
    };
};

export { useEndlessPagination };
export type { TCallbackDefaultPagination };