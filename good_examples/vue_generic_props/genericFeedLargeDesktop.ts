import { defineComponent, h, VNode } from 'vue';
import type { ExtractComponentProps } from './extractComponentPropsUtility';
import type { IFeedFeatureItem } from './types';
import FeedLargeDesktopBase from './FeedLargeDesktopBase.vue';

interface GenericProps<T extends IFeedFeatureItem> extends Omit<
    ExtractComponentProps<typeof FeedLargeDesktopBase>, 'featureListItems' | 'currentVideo'
>{
    featureListItems: T[];
    currentVideo: T | null;
}

interface GenericSlotProps<T extends IFeedFeatureItem> {
    featureItem: T;
    index: number;
}

function useGenericFeedLargeDesktop<T extends IFeedFeatureItem>() {
    const wrapper = defineComponent((props: GenericProps<T>, { slots }) => {
        return () => h(FeedLargeDesktopBase, props, slots);
    });

    return wrapper as typeof wrapper & {
        new (): {
            $slots: {
                'feature-card': (arg: GenericSlotProps<T>) => VNode[];
            };
        };
    };
}

export default useGenericFeedLargeDesktop;
