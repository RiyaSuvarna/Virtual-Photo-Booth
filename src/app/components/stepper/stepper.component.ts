import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoothStateService } from '../../services/booth-state.service';

const STEPS = [
  { id: 1, label: 'Layout' },
  { id: 2, label: 'Capture' },
  { id: 3, label: 'Customize' },
  { id: 4, label: 'Download' },
];

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="stepper">
      <ng-container *ngFor="let s of steps; let i = index">
        <div class="step-item">
          <div class="step-dot"
               [class.active]="state.step() === s.id"
               [class.done]="state.step() > s.id">
            {{ state.step() > s.id ? '✓' : s.id }}
          </div>
          <span class="step-label" [class.active]="state.step() === s.id">{{ s.label }}</span>
        </div>
        <div *ngIf="i < steps.length - 1"
             class="step-line"
             [class.done]="state.step() > s.id"></div>
      </ng-container>
    </nav>
  `,
})
export class StepperComponent {
  state = inject(BoothStateService);
  steps = STEPS;
}
