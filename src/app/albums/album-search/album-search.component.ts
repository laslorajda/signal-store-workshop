import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import { Album, searchAlbums, sortAlbums } from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { patchState, signalState } from '@ngrx/signals';
import { AlbumsService } from '../albums.service';

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="state.showProgress()" />

    <div class="container">
      <h1>Albums ({{ totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="state.query()"
        [order]="state.order()"
        (queryChange)="updateQuery($event)"
        (orderChange)="updateOrder($event)"
      />

      <ngrx-album-list [albums]="filteredAlbums()" [showSpinner]="showSpinner()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent {
  state = signalState({
    albums: [] as Album[],
    query: '',
    order: "asc" as SortOrder,
    showProgress: false
  });
  readonly showSpinner = computed(() => this.state.showProgress() && this.totalAlbums() === 0);
  readonly filteredAlbums = computed(() => sortAlbums(searchAlbums(this.state.albums(), this.state.query()), this.state.order()));
  readonly totalAlbums = computed(() => this.filteredAlbums().length);

  constructor(albumService: AlbumsService) {
    patchState(this.state, { showProgress: true });
    albumService.getAll().subscribe(albums => patchState(this.state, { albums, showProgress: false }));
  }

  updateQuery(query: string): void {
    patchState(this.state, { query });
  }

  updateOrder(order: SortOrder): void {
    patchState(this.state, { order });
  }
}
