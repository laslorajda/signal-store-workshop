import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import { Album, searchAlbums, sortAlbums } from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlbumListComponent } from './album-list/album-list.component';
import { patchState, signalState } from '@ngrx/signals';
import { AlbumsService } from '../albums.service';
import { exhaustMap, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { albumSearchStore } from './album-search.store';

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="store.showProgress()" />

    <div class="container">
      <h1>Albums ({{ store.totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="store.query()"
        [order]="store.order()"
        (queryChange)="store.updateQuery($event)"
        (orderChange)="store.updateOrder($event)"
      />

      <ngrx-album-list [albums]="store.filteredAlbums()" [showSpinner]="store.showSpinner()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [albumSearchStore],
})
export default class AlbumSearchComponent {
  readonly store = inject(albumSearchStore);
}
