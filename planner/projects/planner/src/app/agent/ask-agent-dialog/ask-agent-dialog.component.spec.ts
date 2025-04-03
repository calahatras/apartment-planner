import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskAgentDialogComponent } from './ask-agent-dialog.component';

describe('AskAgentDialogComponent', () => {
  let component: AskAgentDialogComponent;
  let fixture: ComponentFixture<AskAgentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskAgentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskAgentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
