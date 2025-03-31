import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormGroupControlConfig } from '../../forms/form-group-control-config';

@Component({
  selector: 'app-add-floor-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-floor-dialog.component.html',
  styleUrl: './add-floor-dialog.component.scss',
})
export class AddFloorDialogComponent {
  protected readonly dialogRef = inject(MatDialogRef<AddFloorDialogComponent>);
  protected readonly addFloorForm = inject(FormBuilder).group<FormGroupControlConfig<{ name: string }>>({
    name: [''],
  });
}
