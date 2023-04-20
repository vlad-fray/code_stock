<template>
    <div 
        :id="FEED_WRAPPER_ID"
        ref="feedListEl"
        class="feed-rows"
        :style="`height: ${props.feedHeight}px`"
    >
        <div
            ref="itemsWrapperEl"
            class="feed-blocks__wrapper"
            :style="`min-height: ${props.feedHeight}px`"
        >
            <div
                v-for="(feedItem, index) in props.featureListItems"
                :key="`${feedItem.id}_${feedItem.response}_${feedItem.user.id}`"
                class="feed-rows__card-wrapper"
            >
                <slot
                    name="feature-card"
                    :feature-item="feedItem"
                    :index="index"
                ></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useFeedFullScrollHandler } from '~/composables/feed/useFeedFullScrollHandler';

import { IFeedFeatureItem } from './types';
import { FEED_WRAPPER_ID } from './utils';

const props = defineProps<{
    feedHeight: number;
    featureListItems: Array<IFeedFeatureItem>;
    currentVideo: IFeedFeatureItem | null;
    loadNextPage: () => unknown;
    loadPrevPage: () => unknown;
}>();
    
const { feedListEl, itemsWrapperEl } = useFeedFullScrollHandler({
    loadNextPage: props.loadNextPage,
    loadPrevPage: props.loadPrevPage,
});
</script>