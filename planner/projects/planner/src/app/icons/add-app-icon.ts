import { inject } from "@angular/core";
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";

export function addAppIcon(...icons: string[]): void {
  const registry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);

  for (const icon of icons) {
    registry.addSvgIcon(
      icon,
      sanitizer.bypassSecurityTrustResourceUrl(`assets/mdi-icons/${icon}.svg`),
    );
  }
}