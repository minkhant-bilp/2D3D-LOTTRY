import { QueryClient } from '@tanstack/react-query';

/**
 * Module singleton rather than a `useState` in the root layout, so session
 * teardown — which runs outside the React tree — can clear the cache. Without
 * that, a cached `['verifyAuth'] === 'AUTHENTICATED'` survives logout and
 * redirects the next visitor to `/` straight back into the tabs.
 */
export const queryClient = new QueryClient();
