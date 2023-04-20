enum EResumeStatuses {
    PUBLIC = 0,
    OPEN = 1,
    PRIVATE = 2,
    EXCLUSIVE = 3,
    CLOSED = 4,
    DELETE = 5,
}

enum EVacancyStatuses {
    PUBLIC = 0,
    OPEN = 1,
    PRIVATE = 2,
    CLOSED = 4,
    DELETE = 5,
}

interface IFeedVacancyResponseData {
    created_at: string;
    vacancy: {
        id: number;
        title: string;
    };
}

interface IFeedResumeResponseData {
    created_at: string;
    resume: {
        id: number;
        title: string;
    };
}

interface IFeatureUserInfo {
    id: number;
    name: string;
    last_name: string;
    avatar: string | null;
    email: string;
    phone: string | null;
}

interface IFeedFeatureItem {
    id: number;
    title: string;
    video: string | null;
    short_description: string | null;
    user: IFeatureUserInfo;
    status: EResumeStatuses | EVacancyStatuses;
    response: IFeedVacancyResponseData | IFeedResumeResponseData | null;
}

export { IFeedFeatureItem };