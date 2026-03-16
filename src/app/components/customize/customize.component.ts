import {
  Component,
  inject,
  OnInit,
  ElementRef,
  ViewChild,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  BoothStateService,
  FILTERS,
  BG_COLORS,
  BORDERS,
  STICKERS,
} from "../../services/booth-state.service";
import { CanvasRendererService } from "../../services/canvas-renderer.service";

@Component({
  selector: "app-customize",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="section-title">Make it yours</h1>
    <p class="section-sub">
      Add filters, pick a background, and drop in some stickers.
    </p>

    <div class="cust-grid">
      <div class="preview-box">
        <div class="panel-hdr">Live Preview</div>
        <div class="preview-inner">
          <canvas #stripCanvas></canvas>
        </div>
      </div>

      <div class="opts-panel">
        <!-- Filter -->
        <div class="opts-card">
          <div class="opts-ttl">Filter</div>
          <div class="filter-grid">
            <div
              *ngFor="let f of filters"
              class="fbtn"
              [class.active]="state.filter() === f.id"
              (click)="state.setFilter(f.id); redraw()"
            >
              {{ f.label }}
            </div>
          </div>
        </div>

        <!-- Background -->
        <div class="opts-card">
          <div class="opts-ttl">Strip Background</div>
          <div class="color-row">
            <div
              *ngFor="let c of colors"
              class="cswatch"
              [class.active]="state.bgColor() === c"
              [style.background]="c"
              (click)="state.setBgColor(c); redraw()"
            ></div>
          </div>
        </div>

        <!-- Border -->
        <div class="opts-card">
          <div class="opts-ttl">Photo Border</div>
          <div class="brow">
            <div
              *ngFor="let b of borders"
              class="bopt"
              [class.active]="state.border() === b.id"
              (click)="state.setBorder(b.id); redraw()"
            >
              {{ b.label }}
            </div>
          </div>
        </div>

        <!-- Stickers -->
        <div class="opts-card">
          <div class="opts-ttl">Stickers</div>
          <div class="sticker-grid">
            <div
              *ngFor="let s of stickers"
              class="sbtn"
              (click)="addSticker(s)"
            >
              {{ s }}
            </div>
          </div>
          <div class="sticker-added" *ngIf="state.stickers().length > 0">
            Added: {{ state.stickers().slice(-8).join(" ") }}
          </div>
          <div
            class="sticker-added"
            *ngIf="state.stickers().length === 0"
            style="opacity:.5"
          >
            Click stickers to add them to the strip ↑
          </div>
        </div>
      </div>
    </div>

    <div class="nav-row">
      <button class="btn" (click)="state.setStep(2)">← Retake</button>
      <button class="btn primary lg" (click)="state.setStep(4)">
        Download →
      </button>
    </div>
  `,
})
export class CustomizeComponent implements OnInit {
  @ViewChild("stripCanvas", { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  state = inject(BoothStateService);
  renderer = inject(CanvasRendererService);

  filters = FILTERS;
  colors = BG_COLORS;
  borders = BORDERS;
  stickers = STICKERS;

  ngOnInit() {
    this.redraw();
  }

  redraw() {
    setTimeout(() => this.renderer.render(this.canvasRef.nativeElement), 0);
  }

  addSticker(s: string) {
    this.state.addSticker(s);
    this.redraw();
  }
}
