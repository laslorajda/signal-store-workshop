import { SortOrder } from "@/shared/models/sort-order.model";
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { Album, searchAlbums, sortAlbums } from "../album.model";
import { computed, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AlbumsService } from "../albums.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { exhaustMap, filter, pipe, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { setAllEntities, withEntities } from "@ngrx/signals/entities";
import { setError, setPending, setSuccess, withRequestStatus } from "@/shared/state/route/request-status.feature";

export const albumSearchStore = signalStore(
    withState({
        query: '',
        order: 'asc' as SortOrder,
    }),
    withEntities<Album>(),
    withRequestStatus(),
    withComputed(store => {
        const filteredAlbums = computed(() => sortAlbums(searchAlbums(store.entities(), store.query()), store.order()));
        return {
            showSpinner: computed(() => store.isPending() && store.entities().length === 0),
            filteredAlbums,
            totalAlbums: computed(() => filteredAlbums().length)
        }
    }),
    withMethods((store, albumService = inject(AlbumsService), snackBar = inject(MatSnackBar)) => ({
        updateQuery: (query: string) => patchState(store, { query }),
        updateOrder: (order: SortOrder) => patchState(store, { order }),
        loadAllAlbums: rxMethod<void>(
            pipe(
                tap(_ => patchState(store, setPending())),
                exhaustMap(() => albumService.getAll().pipe(
                    tapResponse({
                        next: albums => patchState(store, setAllEntities(albums), setSuccess()),
                        error: (error: { message: string }) => {
                            patchState(store, setError(error.message));
                        }
                    })
                )))),
        notifyOnError: rxMethod<string | undefined>(
            pipe(
                filter(Boolean),
                tap(message => snackBar.open(message, 'Dismiss', { duration: 5000 }))
            ))
    })),
    withHooks({
        onInit({ loadAllAlbums, notifyOnError, error }) {
            loadAllAlbums();
            notifyOnError(error);
        }
    })
)