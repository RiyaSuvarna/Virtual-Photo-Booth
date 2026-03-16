import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoothStateService } from '../../services/booth-state.service';
import { CanvasRendererService } from '../../services/canvas-renderer.service';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="section-title" style="text-align:center">Your strip is ready! 🎉</h1>
    <p class="section-sub" style="text-align:center">Save your photo strip to your device.</p>

    <div class="dl-section">
      <div class="final-wrap">
        <canvas #finalCanvas></canvas>
      </div>

      <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
        <div class="dl-fmts">
          <button class="btn primary lg" (click)="download('png')">⬇ Download PNG</button>
          <button class="btn lg"         (click)="download('jpeg')">⬇ Download JPG</button>
        </div>
        <p class="dl-note">Photos are processed entirely in your browser — nothing is uploaded.</p>
      </div>

      <div style="display:flex;gap:1rem;">
        <button class="btn" (click)="startOver()">↺ Start Over</button>
        <button class="btn" (click)="state.setStep(3)">← Edit Strip</button>
      </div>
    </div>

    <div class="confetti-wrap" id="confettiWrap"></div>
  `,
})
export class DownloadComponent implements OnInit {
  @ViewChild('finalCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  state    = inject(BoothStateService);
  renderer = inject(CanvasRendererService);

  ngOnInit() {
    setTimeout(() => {
      this.renderer.render(this.canvasRef.nativeElement);
      this.launchConfetti();
    }, 100);
  }

  download(fmt: 'png' | 'jpeg') {
    const canvas = this.canvasRef.nativeElement;
    const link = document.createElement('a');
    link.download = `snapbooth-${Date.now()}.${fmt === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = canvas.toDataURL(fmt === 'jpeg' ? 'image/jpeg' : 'image/png', 0.95);
    link.click();
  }

  startOver() {
    this.state.resetAll();
  }

  private launchConfetti() {
    const wrap = document.getElementById('confettiWrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    const cols = ['#f5c842','#e8a4c8','#7dd3fc','#86efac','#fb923c','#c4b5fd','#f87171'];
    for (let i = 0; i < 80; i++) {
      const d = document.createElement('div');
      const sz = 5 + Math.random() * 9;
      d.style.cssText = `
        position:absolute;left:${Math.random()*100}%;top:-12px;
        width:${sz}px;height:${sz}px;
        background:${cols[Math.floor(Math.random()*cols.length)]};
        border-radius:${Math.random()>.5?'50%':'2px'};
        transform:rotate(${Math.random()*360}deg);
        animation:cffall ${2+Math.random()*2.5}s ${Math.random()*1.8}s ease-in forwards;
      `;
      wrap.appendChild(d);
    }
    setTimeout(() => { if (wrap) wrap.innerHTML = ''; }, 6000);
  }
}
