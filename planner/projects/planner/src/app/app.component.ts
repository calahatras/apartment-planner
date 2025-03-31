import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith, switchMap } from 'rxjs';
import { addAppIcon } from './icons/add-app-icon';

@Component({
  selector: 'app-root',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly location = inject(Location);
  protected readonly canNavigateBack = toSignal(
    inject(Router).events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap(() => this.route.firstChild!.data),
      map(data => data?.['canNavigateBack'] || false),
      startWith(false),
    ),
    {
      requireSync: true,
    },
  );

  constructor() {
    addAppIcon(
      'arrow-left',
      'menu',
    );
  }
}
