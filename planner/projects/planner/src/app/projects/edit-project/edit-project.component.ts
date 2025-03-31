import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs';
import { DesignerComponent } from '../../design/designer/designer.component';
import { FormGroupControlConfig } from '../../forms/form-group-control-config';
import { addAppIcon } from '../../icons/add-app-icon';
import { AddFloorDialogComponent } from '../add-floor-dialog/add-floor-dialog.component';
import { ApartmentFloor, Project } from '../store/project';
import { ProjectsStore } from '../store/projects.store';

interface ApartmentFloorFormData {
  name: ApartmentFloor['name'];
}

@Component({
  selector: 'app-edit-project',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    DesignerComponent,
  ],
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProjectComponent {
  private readonly dialog = inject(MatDialog);
  protected readonly projectStore = inject(ProjectsStore);
  protected readonly projectId = toSignal<Project['id']>(
    inject(ActivatedRoute).params.pipe(
      map(params => params['id']),
      filter((id: string | undefined): id is string => Boolean(id)),
    ),
    {
      initialValue: undefined,
    },
  );
  protected readonly project = computed(() => {
    const projects = this.projectStore.projects();
    const id = this.projectId();
    return projects.find(project => project.id === id);
  });

  protected readonly apartmentSelectionForm = inject(FormBuilder).group<FormGroupControlConfig<{ id: IDBValidKey }>>({
    id: [''],
  });

  protected readonly addApartmentFloorForm = inject(FormBuilder).nonNullable.group<FormGroupControlConfig<ApartmentFloorFormData>>({
    name: [''],
  });

  protected readonly apartmentFloorId = toSignal(
    this.apartmentSelectionForm.valueChanges.pipe(map(value => value.id)),
    {
      initialValue: null,
    },
  );

  protected readonly apartmentFloor = computed(() => {
    const project = this.project();
    const id = this.apartmentFloorId();
    return id && project && project.floors.find(floor => floor.id === id);
  });

  constructor() {
    addAppIcon('plus');
  }

  protected addFloor(): void {
    const projectId = this.projectId();
    if (!projectId) {
      throw new Error('Project ID not found');
    }
    const ref = this.dialog.open(AddFloorDialogComponent);
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.saveProject(projectId, result);
      }
    });
  }

  protected saveProject(projectId: Project['id'], floor: Partial<ApartmentFloorFormData>): void {
    const floorData: Omit<ApartmentFloor, 'id'> = {
      plan: [
        { x: 0, y: 0 },
        { x: 0, y: 400 },
        { x: 400, y: 400 },
        { x: 400, y: 0 },
      ],
      furniture: [],
      name: 'Default',
      ...floor,
    };
    this.projectStore.addFloor(projectId, floorData);
  }

  //implements AfterViewInit, OnDestroy {
  /*
  private readonly svgRef = viewChild.required<ElementRef<SVGElement>>('svg');
  private selectedVertex: SVGCircleElement | null = null;
  ngAfterViewInit() {
    const svg = this.svgRef().nativeElement;
    console.log(svg);
    const vertices = svg.querySelectorAll<SVGCircleElement>('.vertex');

    vertices.forEach(vertex => {
      vertex.addEventListener('mousedown', this.onMouseDown);
    });

    svg.addEventListener('mousemove', this.onMouseMove);
    svg.addEventListener('mouseup', this.onMouseUp);
  }

  ngOnDestroy() {
    const svg = this.svgRef().nativeElement;
    const vertices = svg.querySelectorAll<SVGCircleElement>('.vertex');

    vertices.forEach(vertex => {
      vertex.removeEventListener('mousedown', this.onMouseDown);
    });

    svg.removeEventListener('mousemove', this.onMouseMove);
    svg.removeEventListener('mouseup', this.onMouseUp);
  }

  private onMouseDown = (event: MouseEvent) => {
    this.selectedVertex = event.target as SVGCircleElement;
  };

  private onMouseMove = (event: MouseEvent) => {
    if (this.selectedVertex) {
      const svg = this.svgRef().nativeElement;
      const rect = svg.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.selectedVertex.setAttribute('cx', x.toString());
      this.selectedVertex.setAttribute('cy', y.toString());
      this.updatePolygon();
    }
  };

  private onMouseUp = () => {
    this.selectedVertex = null;
  };

  private updatePolygon() {
    const svg = this.svgRef().nativeElement;
    const vertices = svg.querySelectorAll<SVGCircleElement>('.vertex');
    const points = Array.from(vertices).map(vertex => {
      return `${vertex.getAttribute('cx')},${vertex.getAttribute('cy')}`;
    }).join(' ');
    svg.querySelector<SVGPolygonElement>('#apartment-plan')!.setAttribute('points', points);
  }
  */
}
