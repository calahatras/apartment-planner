import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormGroupControlConfig } from '../../forms/form-group-control-config';
import { Project } from '../store/project';
import { ProjectsStore } from '../store/projects.store';

type ProjectFormData = Omit<Project, 'id'>;

function isUnique<T>(
  key: keyof T,
  values: T[],
): (control: AbstractControl) => { unique: boolean } | null {
  return ({ value }) =>
    value && values.some(item => (item[key] as string).localeCompare(value as string) === 0)
      ? { unique: true }
      : null;
}

const defaultProjectValues: ProjectFormData = {
  name: '',
  description: '',
  floors: [],
};

@Component({
  selector: 'app-create-project',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProjectComponent {
  protected readonly store = inject(ProjectsStore);
  private readonly location = inject(Location);
  protected readonly projectForm = inject(FormBuilder).nonNullable.group<FormGroupControlConfig<ProjectFormData>>({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        isUnique('name', this.store.projects()),
      ],
    ],
    description: [''],
    floors: [[]],
  });
  protected get nameControl(): FormControl {
    return this.projectForm.get('name') as FormControl;
  }

  protected onSubmit(data: Partial<ProjectFormData>): void {
    this.store.addProject({
      ...defaultProjectValues,
      ...data,
    });
    this.location.back();
  }
}
