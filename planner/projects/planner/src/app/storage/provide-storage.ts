import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { StorageOptions, StorageOptionsToken, StorageService } from "./storage.service";

export function provideStorage(
  options: StorageOptions,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    StorageService,
    { provide: StorageOptionsToken, useValue: options },
  ]);
}