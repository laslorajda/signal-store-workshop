import { toSortOrder } from "@/shared/models/sort-order.model";
import { signalStore, withComputed, withHooks, withMethods } from "@ngrx/signals";
import { Album, searchAlbums, sortAlbums } from "../album.model";
import { computed, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { filter, pipe, tap } from "rxjs";
import { withEntities } from "@ngrx/signals/entities";
import { withQueryParams } from "@/shared/state/route/query-params.feature";
import { AlbumStore } from "../album.store";

export const albumSearchStore = signalStore(
    withQueryParams({
        query: param => param ?? '',
        order: toSortOrder
    }),
    withEntities<Album>(),
    withComputed(({ query, order }, albumStore = inject(AlbumStore)) => {
        const filteredAlbums = computed(() => sortAlbums(searchAlbums(albumStore.entities(), query()), order()));
        return {
            showSpinner: computed(() => albumStore.isPending() && albumStore.entities().length === 0),
            filteredAlbums,
            totalAlbums: computed(() => filteredAlbums().length)
        }
    }),
    withMethods((_, snackBar = inject(MatSnackBar)) => ({
        notifyOnError: rxMethod<string | undefined>(
            pipe(
                filter(Boolean),
                tap((message) => snackBar.open(message!, 'Close', { duration: 5000 }))
            )
        )
    })),
    withHooks({
        onInit({ notifyOnError }, albumStore = inject(AlbumStore)) {
            albumStore.loadAllAlbums();
            notifyOnError(albumStore.error);
        }
    })
)