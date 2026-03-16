import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoothStateService } from './services/booth-state.service';
import { StepperComponent } from './components/stepper/stepper.component';
import { LayoutPickerComponent } from './components/layout-picker/layout-picker.component';
import { CameraComponent } from './components/camera/camera.component';
import { CustomizeComponent } from './components/customize/customize.component';
import { DownloadComponent } from './components/download/download.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    StepperComponent,
    LayoutPickerComponent,
    CameraComponent,
    CustomizeComponent,
    DownloadComponent,
  ],
  template: `
    <div class="app">
      <header class="header">
        <div class="logo">Snap<span>Booth</span></div>
        <div class="header-badge">✦ Virtual Photo Booth</div>
      </header>
      <main class="main">
        <app-stepper />
        <app-layout-picker *ngIf="state.step() === 1" />
        <app-camera       *ngIf="state.step() === 2" />
        <app-customize    *ngIf="state.step() === 3" />
        <app-download     *ngIf="state.step() === 4" />
      </main>
    </div>
  `,
})
export class AppComponent {
  state = inject(BoothStateService);
}
