import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { addAppIcon } from '../../icons/add-app-icon';
import { ProjectsStore } from '../store/projects.store';

@Component({
  selector: 'app-projects-overview',
  imports: [
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './projects-overview.component.html',
  styleUrl: './projects-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsOverviewComponent {
  protected readonly store = inject(ProjectsStore);
  constructor() {
    addAppIcon('plus');
  }
}
