import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Album } from "./album.model";
import { setError, setPending, setSuccess, withRequestStatus } from "@/shared/state/route/request-status.feature";
import { AlbumsService } from "./albums.service";
import { inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap, exhaustMap } from "rxjs";

export const AlbumStore = signalStore(
    { providedIn: 'root' },
    withEntities<Album>(),
    withRequestStatus(),
    withMethods((store, albumsService = inject(AlbumsService)) => ({
        loadAllAlbums: rxMethod<void>(
            pipe(
              tap(() => patchState(store, setPending())),
              exhaustMap(() => {
                return albumsService.getAll().pipe(
                  tapResponse({
                    next: (albums) => {
                      patchState(store, setAllEntities(albums), setSuccess());
                    },
                    error: (error: { message: string }) => {
                      patchState(store, setError(error.message));
                    },
                  }),
                );
              }),
            ),
          )
    }))
)