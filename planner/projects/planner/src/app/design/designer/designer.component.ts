import { Component, computed, ElementRef, HostListener, inject, input, output, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { addAppIcon } from '../../icons/add-app-icon';
import { ApartmentFloor, Furniture, Vertex } from '../../projects/store/project';
import { MatDialog } from '@angular/material/dialog';
import { AskAgentDialogComponent } from '../../agent/ask-agent-dialog/ask-agent-dialog.component';
import { HttpClient } from '@angular/common/http';
import { filter, switchMap, tap } from 'rxjs';

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface CreatedFurniture {
  name: string;
  origin: { x: number, y: number };
  angle: number;
  width: number;
  depth: number;
  texture: string;
}

@Component({
  selector: 'app-designer',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
})
export class DesignerComponent {
  public readonly floor = input.required<ApartmentFloor>();
  protected readonly floorFurniture = computed(() => this.floor().furniture.map(item => ({
    ...item,
    poly: item.bounds.map(b => `${b.x},${b.y}`).join(' '),
  })));
  protected readonly designerRoot = viewChild.required<ElementRef<SVGElement>>('designerRoot');

  public readonly furnitureAdded = output<Furniture>();
  public readonly furnitureRemoved = output<Furniture['id']>();
  public readonly furnitureUpdated = output<Furniture>();

  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected readonly edges = computed<Edge[]>(() => {
    const vertices = this.floor().plan;
    return vertices.map((vertex, index) => {
      const nextIndex = (index + 1) % vertices.length;
      const nextVertex = vertices[nextIndex];
      return {
        x1: vertex.x,
        y1: vertex.y,
        x2: nextVertex.x,
        y2: nextVertex.y,
      };
    });
  });

  private selectedVertex: Vertex | null = null;
  private isPanning = false;
  private startX = 0;
  private startY = 0;
  protected panX = 0;
  protected panY = 0;
  private zoomLevel = 1;
  protected readonly transform = signal<string>('');

  constructor() {
    addAppIcon(
      'creation',
      'package-variant-closed-plus',
      'refresh',
    );
  }

  protected addFurniture() {
    console.log('add furniture');
  }

  protected askAgent() {
    const ref = this.dialog.open(
      AskAgentDialogComponent,
      {
        data: {
          title: 'Ask Agent',
          message: 'What furniture do you want to add?',
        },
      },
    );
    ref.afterClosed().pipe(
      filter(Boolean),
      tap(c => console.log(c)),
      switchMap((result: string) =>
        this.http.post<CreatedFurniture>(
          'https://localhost:7009/api/ask',
          { question: result, name: this.floor().name },
          { headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ).subscribe((response) => {
      console.log(response);
      const defaultFurniture: Pick<Furniture, 'id' | 'name'> = {
        id: crypto.randomUUID(),
        name: 'Default',
      };
      const scale = 1;
      this.furnitureAdded.emit({
        ...defaultFurniture,
        ...response,
        height: 1,
        bounds: [
          { x: response.origin.x * scale, y: response.origin.y * scale },
          { x: (response.origin.x + response.width) * scale, y: response.origin.y * scale },
          { x: (response.origin.x + response.width) * scale, y: (response.origin.y + response.depth) * scale },
          { x: response.origin.x * scale, y: (response.origin.y + response.depth) * scale },
        ],
      });
    });
  }

  protected resetView() {
    this.panX = 0;
    this.panY = 0;
    this.zoomLevel = 1;
    this.updateTransform();
  }

  private updateTransform(): void {
    this.transform.set(`translate(${this.panX}, ${this.panY}) scale(${this.zoomLevel})`);
  }

  protected onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.isPanning = true;
      this.startX = event.clientX - this.panX;
      this.startY = event.clientY - this.panY;
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      this.panX = event.clientX - this.startX;
      this.panY = event.clientY - this.startY;
      this.updateTransform();
    } else if (this.selectedVertex) {
      const rect = this.designerRoot().nativeElement.getBoundingClientRect();
      const x = (event.clientX - rect.left - this.panX) / this.zoomLevel;
      const y = (event.clientY - rect.top - this.panY) / this.zoomLevel;
      this.selectedVertex.x = x;
      this.selectedVertex.y = y;
    }
  }

  protected onMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
      this.isPanning = false;
    }
    this.selectedVertex = null;
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, 0.1), 10);
    this.updateTransform();
  }

  protected selectVertex(event: MouseEvent, vertex: Vertex): void {
    if (event.button === 0) {
      this.selectedVertex = vertex;
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected handleKeyDown(event: KeyboardEvent): void {
    if (event.key === '1') {
      this.zoomLevel = 1;
      this.updateTransform();
    } else if (event.key === '2') {
      this.zoomLevel = 2;
      this.updateTransform();
    }
  }
}