import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoothStateService, LAYOUTS, LayoutId } from '../../services/booth-state.service';

@Component({
  selector: 'app-layout-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="section-title">Choose your layout</h1>
    <p class="section-sub">Pick how your 4 photos are arranged in the final strip.</p>

    <div class="layout-grid">
      <div *ngFor="let l of layouts"
           class="layout-card"
           [class.selected]="state.layout() === l.id"
           (click)="state.setLayout(l.id)">
        <div class="lp {{ l.lpClass }}">
          <div class="c" *ngFor="let _ of cells"></div>
        </div>
        <div class="layout-name">{{ l.name }}</div>
        <div class="layout-desc">{{ l.desc }}</div>
      </div>
    </div>

    <div class="nav-row">
      <div></div>
      <button class="btn primary lg" (click)="state.setStep(2)">Continue →</button>
    </div>
  `,
})
export class LayoutPickerComponent {
  state   = inject(BoothStateService);
  layouts = LAYOUTS;
  cells   = [1, 2, 3, 4];
}
