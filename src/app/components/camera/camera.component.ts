import { Component, inject, OnDestroy, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoothStateService } from '../../services/booth-state.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="section-title">Strike a pose</h1>
    <p class="section-sub">Take 4 photos — a 3-second countdown gives you time to get ready!</p>

    <div class="camera-section">
      <div>
        <div class="camera-box">
          <div class="cam-hdr">
            <span class="cam-lbl">Live Camera</span>
            <span class="rec-dot" *ngIf="cameraActive()"></span>
          </div>
          <video #videoEl autoplay playsinline muted></video>
          <canvas #captureCanvas style="display:none"></canvas>

          <div class="cam-overlay" [class.hidden]="cameraActive()">
            <svg width="60" height="60" viewBox="0 0 48 48" fill="none" style="opacity:.4">
              <rect x="4" y="12" width="40" height="28" rx="4" stroke="white" stroke-width="2.5"/>
              <circle cx="24" cy="26" r="7" stroke="white" stroke-width="2.5"/>
              <path d="M17 12l3-5h8l3 5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <p class="no-cam-text">Click <strong style="color:var(--text)">Start Camera</strong> below to enable your webcam.</p>
          </div>

          <div class="cdown-overlay" [class.show]="showCountdown()">
            <span class="cdown-num" [style.animation]="countdownAnim()">{{ countdownNum() }}</span>
          </div>
          <div class="flash-el" [class.go]="showFlash()"></div>
        </div>

        <div class="cam-controls">
          <button class="btn" [disabled]="cameraActive()" (click)="startCamera()">📷 Start Camera</button>
          <button class="btn primary" [disabled]="!cameraActive() || isShooting() || state.shots().length >= 4" (click)="shootCountdown()">⚡ Take Photo</button>
          <button class="btn" [disabled]="!cameraActive() || autoMode() || state.shots().length >= 4" (click)="autoShootAll()" title="Auto-take all remaining shots">🎬 Auto All</button>
          <button class="btn danger" *ngIf="state.shots().length > 0" (click)="state.resetShots()">✕ Reset</button>
          <span class="shot-ctr">{{ state.shots().length }} / 4</span>
        </div>
      </div>

      <div class="shots-panel">
        <div class="panel-hdr">Shot Preview Strip</div>
        <div class="shots-list">
          <ng-container *ngIf="state.shots().length === 0">
            <div class="shots-empty">No photos yet.<br>Start the camera and press <strong style="color:var(--text)">Take Photo</strong>!</div>
          </ng-container>
          <div *ngFor="let i of [0,1,2,3]"
               class="shot-thumb"
               [class.next-up]="i === state.shots().length && i < 4">
            <span class="snum">{{ i + 1 }}</span>
            <img *ngIf="state.shots()[i]" [src]="state.shots()[i]" />
            <span *ngIf="state.shots()[i]" class="scheck">✓</span>
            <div *ngIf="!state.shots()[i]" class="ph">{{ i === state.shots().length ? '●' : '○' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="nav-row">
      <button class="btn" (click)="state.setStep(1)">← Back</button>
      <button class="btn primary lg" [disabled]="state.shots().length < 4" (click)="state.setStep(3)">Customize Strip →</button>
    </div>
  `,
})
export class CameraComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoEl')      videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('captureCanvas') captureCanvas!: ElementRef<HTMLCanvasElement>;

  state = inject(BoothStateService);

  cameraActive  = signal(false);
  isShooting    = signal(false);
  autoMode      = signal(false);
  showCountdown = signal(false);
  showFlash     = signal(false);
  countdownNum  = signal(3);
  countdownAnim = signal('');

  private stream: MediaStream | null = null;

  ngAfterViewInit() {}

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      this.videoEl.nativeElement.srcObject = this.stream;
      this.cameraActive.set(true);
    } catch {
      alert('Camera access was denied or unavailable.\nPlease allow camera permissions and try again.');
    }
  }

  shootCountdown(onDone?: () => void) {
    if (this.isShooting() || this.state.shots().length >= 4) return;
    this.isShooting.set(true);
    let n = 3;
    this.showCountdown.set(true);
    this.countdownNum.set(n);
    this.triggerAnim();

    const tick = setInterval(() => {
      n--;
      if (n > 0) {
        this.countdownNum.set(n);
        this.triggerAnim();
      } else {
        clearInterval(tick);
        this.showCountdown.set(false);
        this.capturePhoto();
        this.isShooting.set(false);
        onDone?.();
      }
    }, 950);
  }

  private triggerAnim() {
    this.countdownAnim.set('none');
    setTimeout(() => this.countdownAnim.set('cdown-pop .9s ease-in-out forwards'), 10);
  }

  private capturePhoto() {
    const v = this.videoEl.nativeElement;
    const c = this.captureCanvas.nativeElement;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext('2d')!;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.state.addShot(c.toDataURL('image/png'));
    this.showFlash.set(true);
    setTimeout(() => this.showFlash.set(false), 120);
  }

  autoShootAll() {
    if (this.autoMode() || !this.cameraActive()) return;
    this.autoMode.set(true);
    const go = () => {
      if (this.state.shots().length < 4) {
        setTimeout(() => this.shootCountdown(() => { if (this.state.shots().length < 4) go(); else this.autoMode.set(false); }), 700);
      } else {
        this.autoMode.set(false);
      }
    };
    go();
  }

  ngOnDestroy() {
    this.stream?.getTracks().forEach(t => t.stop());
  }
}
