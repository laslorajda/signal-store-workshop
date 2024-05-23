import { computed } from "@angular/core";
import { signalStoreFeature, withComputed, withState } from "@ngrx/signals";

export type RequestStatus = 'idle' | 'pending' | 'success' | { error: string };

export type RequestStatusState = { requestStatus: RequestStatus };

export function withRequestStatus() {
    return signalStoreFeature(
        withState<RequestStatusState>({ requestStatus: 'idle' }),
        withComputed(({ requestStatus }) => ({
            isIdle: computed(() => requestStatus() === 'idle'),
            isPending: computed(() => requestStatus() === 'pending'),
            isSuccess: computed(() => requestStatus() === 'success'),
            error: computed(() => {
                const status = requestStatus();
                return typeof status === 'object' ? status.error : undefined;
            })
        }))
    );
}

export function setPending(): RequestStatusState {
    return { requestStatus: 'pending' };
}

export function setSuccess(): RequestStatusState {
    return { requestStatus: 'success' };
}

export function setError(error: string): RequestStatusState {
    return { requestStatus: { error } };
}