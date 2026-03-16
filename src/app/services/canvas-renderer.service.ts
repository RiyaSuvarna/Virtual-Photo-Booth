import { Injectable } from "@angular/core";
import { BoothStateService, FILTERS, LayoutId } from "./booth-state.service";

interface PhotoPos {
  x: number;
  y: number;
  w: number;
  h: number;
  polFrame?: { x: number; y: number; w: number; h: number };
}

@Injectable({ providedIn: "root" })
export class CanvasRendererService {
  constructor(private state: BoothStateService) {}

  buildPositions(layout: LayoutId): {
    W: number;
    H: number;
    positions: PhotoPos[];
  } {
    const PW = 240,
      PH = 180,
      PAD = 20,
      GAP = 10;
    let W = 0,
      H = 0;
    const positions: PhotoPos[] = [];

    if (layout === "vertical") {
      W = PW + PAD * 2;
      H = PH * 4 + GAP * 3 + PAD * 2 + 32;
      for (let i = 0; i < 4; i++)
        positions.push({ x: PAD, y: PAD + i * (PH + GAP), w: PW, h: PH });
    } else if (layout === "grid") {
      W = PW * 2 + GAP + PAD * 2;
      H = PH * 2 + GAP + PAD * 2 + 32;
      positions.push(
        { x: PAD, y: PAD, w: PW, h: PH },
        { x: PAD + PW + GAP, y: PAD, w: PW, h: PH },
        { x: PAD, y: PAD + PH + GAP, w: PW, h: PH },
        { x: PAD + PW + GAP, y: PAD + PH + GAP, w: PW, h: PH },
      );
    } else if (layout === "wide") {
      W = (PW + GAP) * 4 - GAP + PAD * 2;
      H = PH + PAD * 2 + 32;
      for (let i = 0; i < 4; i++)
        positions.push({ x: PAD + i * (PW + GAP), y: PAD, w: PW, h: PH });
    } else {
      // polaroid
      const FW = PW + 20,
        FH = PH + 36,
        FPL = 10,
        FPTOP = 10;
      W = FW + PAD * 2;
      H = (FH + GAP) * 4 - GAP + PAD * 2 + 32;
      for (let i = 0; i < 4; i++) {
        positions.push({
          x: PAD + FPL,
          y: PAD + FPTOP + i * (FH + GAP),
          w: PW,
          h: PH,
          polFrame: { x: PAD, y: PAD + i * (FH + GAP), w: FW, h: FH },
        });
      }
    }
    return { W, H, positions };
  }

  async render(canvas: HTMLCanvasElement): Promise<void> {
    const layout = this.state.layout();
    const shots = this.state.shots();
    const filter = this.state.filter();
    const bgColor = this.state.bgColor();
    const border = this.state.border();
    const stickers = this.state.stickers();

    const { W, H, positions } = this.buildPositions(layout);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = this.isDark(bgColor)
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.06)";
    for (let x = 0; x < W; x += 14)
      for (let y = 0; y < H; y += 14) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

    const fl = FILTERS.find((f) => f.id === filter);

    const loaded = await Promise.all(
      shots.map(
        (src) =>
          new Promise<HTMLImageElement>((res) => {
            const img = new Image();
            img.onload = () => res(img);
            img.src = src;
          }),
      ),
    );

    loaded.forEach((img, i) => {
      const p = positions[i];
      if (!p) return;
      if (p.polFrame) {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#fff";
        this.rr(ctx, p.polFrame.x, p.polFrame.y, p.polFrame.w, p.polFrame.h, 4);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      if (border === "shadow") {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;
      }
      if (border === "round") {
        ctx.beginPath();
        this.rr(ctx, p.x, p.y, p.w, p.h, 12);
        ctx.clip();
      }
      if (fl?.cssFilter) ctx.filter = fl.cssFilter;
      ctx.drawImage(img, p.x, p.y, p.w, p.h);
      ctx.restore();
      if (border === "thin" || border === "thick") {
        ctx.save();
        ctx.strokeStyle = this.isDark(bgColor)
          ? "rgba(255,255,255,0.45)"
          : "rgba(0,0,0,0.3)";
        ctx.lineWidth = border === "thick" ? 4 : 2;
        ctx.strokeRect(
          p.x + ctx.lineWidth / 2,
          p.y + ctx.lineWidth / 2,
          p.w - ctx.lineWidth,
          p.h - ctx.lineWidth,
        );
        ctx.restore();
      }
      if (border === "round") {
        ctx.save();
        ctx.strokeStyle = this.isDark(bgColor)
          ? "rgba(255,255,255,0.45)"
          : "rgba(0,0,0,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.rr(ctx, p.x, p.y, p.w, p.h, 12);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = this.isDark(bgColor)
        ? "rgba(255,255,255,0.55)"
        : "rgba(0,0,0,0.45)";
      ctx.font = "bold 11px DM Sans, sans-serif";
      ctx.fillText(String(i + 1), p.x + 6, p.y + p.h - 7);
      ctx.restore();
    });

    if (stickers.length > 0) {
      ctx.save();

      ctx.font =
        '26px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      stickers.slice(-Math.floor((W - 40) / 36)).forEach((s, i) => {
        const x = 28 + i * 36;
        const y = H - 18;

        // shadow for visibility
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        // draw emoji
        ctx.fillText(s, x, y);

        // white outline (important)
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.strokeText(s, x, y);
      });

      ctx.restore();
    }
    ctx.save();
    ctx.fillStyle = this.isDark(bgColor)
      ? "rgba(255,255,255,0.2)"
      : "rgba(0,0,0,0.18)";
    ctx.font = "500 11px DM Sans, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("SnapBooth", W - 20, H - 8);
    ctx.restore();
  }

  private rr(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  isDark(hex: string): boolean {
    try {
      const c = hex.replace("#", "");
      const r = parseInt(c.substr(0, 2), 16),
        g = parseInt(c.substr(2, 2), 16),
        b = parseInt(c.substr(4, 2), 16);
      return r * 0.299 + g * 0.587 + b * 0.114 < 130;
    } catch {
      return false;
    }
  }
}
