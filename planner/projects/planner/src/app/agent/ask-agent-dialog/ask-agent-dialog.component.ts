import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ask-agent-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './ask-agent-dialog.component.html',
  styleUrl: './ask-agent-dialog.component.scss',
})
export class AskAgentDialogComponent {
  protected question = 'Please create a chair in the corner of the room';
}
