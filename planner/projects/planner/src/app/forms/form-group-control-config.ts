import { ControlConfig } from '@angular/forms';


export type FormGroupControlConfig<T> = {
  [K in keyof T]: ControlConfig<T[K]>;
};
