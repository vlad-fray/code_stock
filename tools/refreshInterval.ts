import { BroadcastChannel } from 'broadcast-channel';

enum EEventTypes {
    login = 'LOGIN',
    logout = 'LOGOUT',
    refresh = 'REFRESH',
}

interface IAccessTokens {
    access: string;
    refresh: string;
}

interface IAuthMessage {
    type: EEventTypes;
    message?: unknown;
}

interface IRefreshMessage extends IAuthMessage {
    type: EEventTypes.refresh;
    message: IAccessTokens;
}

interface ILoginMessage extends IAuthMessage {
    type: EEventTypes.login;
    message: IAccessTokens;
}

interface ILogoutMessage extends IAuthMessage {
    type: EEventTypes.logout;
}

type TAuthMessage = IRefreshMessage | ILoginMessage | ILogoutMessage;

const DEFAULT_REFRESH_INTERVAL = 4 * 60 * 1000;
const BROADCAST_AUTH_EVENT_NAME = 'auth-events';

//template functions and temps
const accessTokens = { value: { access: 'fff', refresh: 'fff' } };
const refresh: () => Promise<boolean> = () => new Promise((resolve) => resolve(true));
const loginLocally = (tokens: IAccessTokens) => null;
const logoutLocally = () => null;

const channel: BroadcastChannel<TAuthMessage> = new BroadcastChannel(BROADCAST_AUTH_EVENT_NAME);

class RefreshInterval {
    static refreshInterval: ReturnType<typeof setInterval> | null = null;

    static onMessageHandler(messageEvent: TAuthMessage) {
        if (messageEvent.type === EEventTypes.refresh || messageEvent.type === EEventTypes.login) {
            loginLocally(messageEvent.message);
            RefreshInterval.resetRefreshInterval();
        }

        if (messageEvent.type === EEventTypes.logout) {
            logoutLocally();
            RefreshInterval.clearRefreshInterval();
        }
    }

    static resetRefreshInterval() {
        RefreshInterval.clearRefreshInterval();

        RefreshInterval.refreshInterval = setInterval(async () => {
            const success: boolean = await refresh();

            if (!success) {
                return RefreshInterval.clearRefreshInterval();
            }

            if (!accessTokens.value.access || !accessTokens.value.refresh) return;

            channel.postMessage({
                type: EEventTypes.refresh,
                message: { 
                    access: accessTokens.value.access,
                    refresh: accessTokens.value.refresh,
                },
            });
        }, DEFAULT_REFRESH_INTERVAL);
    }

    static clearRefreshInterval() {
        if (RefreshInterval.refreshInterval) {
            clearInterval(RefreshInterval.refreshInterval);
            RefreshInterval.refreshInterval = null;
        }
    }

    static sendLogoutEvent() {
        channel.postMessage({
            type: EEventTypes.logout,
        });
    }

    static sendLoginEvent(tokens: IAccessTokens) {
        channel.postMessage({
            type: EEventTypes.login,
            message: tokens,
        });
    }

    static sendRefreshEvent(tokens: IAccessTokens) {
        channel.postMessage({
            type: EEventTypes.refresh,
            message: tokens,
        });
    }

    static async initRefreshInterval(onAppLoadedCallback: () => void) {
        await refresh();

        onAppLoadedCallback();
        RefreshInterval.resetRefreshInterval();

        channel.addEventListener('message', RefreshInterval.onMessageHandler);
    }

    static destroyRefreshInterval() {
        RefreshInterval.clearRefreshInterval();
        channel.removeEventListener('message', RefreshInterval.onMessageHandler);
    }
}

export { RefreshInterval };
