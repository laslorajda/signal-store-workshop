import { SortOrder } from "@/shared/models/sort-order.model";
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { Album, searchAlbums, sortAlbums } from "../album.model";
import { computed, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AlbumsService } from "../albums.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { exhaustMap, pipe, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";

export const albumSearchStore = signalStore(
    withState({
        albums: [] as Album[],
        query: '',
        order: 'asc' as SortOrder,
        showProgress: false
    }),
    withComputed(store => {
        const filteredAlbums = computed(() => sortAlbums(searchAlbums(store.albums(), store.query()), store.order()));
        return {
            showSpinner: computed(() => store.showProgress() && store.albums().length === 0),
            filteredAlbums,
            totalAlbums: computed(() => filteredAlbums().length)
        }
    }),
    withMethods((store, albumService = inject(AlbumsService), snackBar = inject(MatSnackBar)) => ({
        updateQuery: (query: string) => patchState(store, { query }),
        updateOrder: (order: SortOrder) => patchState(store, { order }),
        loadAllAlbums: rxMethod<void>(
            pipe(
                tap(_ => patchState(store, { showProgress: true })),
                exhaustMap(() => albumService.getAll().pipe(
                    tapResponse({
                        next: albums => patchState(store, { albums, showProgress: false }),
                        error: (error: { message: string }) => {
                            snackBar.open(error.message, 'Dismiss', { duration: 3000 });
                            patchState(store, { showProgress: false });
                        }
                    })
                ))))
    })),
    withHooks({
        onInit({ loadAllAlbums }) {
            loadAllAlbums();
        }
    })
)