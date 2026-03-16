# SnapBooth — Virtual Photo Booth

A fully-featured virtual photo booth built with **Angular 17** (standalone components, signals).

---

## 📦 Project Contents

```
photo-booth/
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.css
        └── app/
            ├── app.component.ts
            ├── services/
            │   ├── booth-state.service.ts      ← Global state (Signals)
            │   └── canvas-renderer.service.ts  ← Photo strip canvas engine
            └── components/
                ├── stepper/stepper.component.ts
                ├── layout-picker/layout-picker.component.ts
                ├── camera/camera.component.ts
                ├── customize/customize.component.ts
                └── download/download.component.ts
```

## 🅰️ Angular Development Setup

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
npm install
npm start
# Opens at http://localhost:4200
```

### Build for Production

```bash
npm run build
# Output in dist/snap-booth/
```

---

## ✨ Features

### Step 1 — Layout Picker

Choose from **4 layout options** for your photo strip:
| Layout | Description |
|--------|-------------|
| Classic Strip | 4 photos stacked vertically |
| 2×2 Grid | 4 photos in a square arrangement |
| Wide Strip | 4 photos displayed side by side |
| Polaroid | 4 polaroid-style framed photos |

### Step 2 — Camera Capture

- Live webcam preview (mirrored like a real photo booth)
- **3-second countdown** before each shot
- **Auto All** — auto-takes all 4 shots in sequence
- Shot preview strip shows captured photos in real time
- Reset and retake any time

### Step 3 — Customize

- **9 photo filters**: Original, B&W, Sepia, Vivid, Fade, Dramatic, Warm, Cool, Retro
- **12 background colours** for the strip
- **5 border styles**: None, Thin, Thick, Rounded, Shadow
- **18 stickers** to add to the strip bottom
- Live canvas preview updates instantly

### Step 4 — Download

- Download as **PNG** (lossless) or **JPG** (smaller file)
- Confetti celebration animation 🎉
- Everything processed 100% in the browser — no data uploaded

---

## 🏗️ Angular Architecture

### State Management

`BoothStateService` uses Angular **Signals** for reactive state:

```ts
step = signal<number>(1);
layout = signal<LayoutId>("vertical");
shots = signal<string[]>([]);
filter = signal<FilterId>("none");
bgColor = signal<string>("#ffffff");
border = signal<BorderId>("none");
stickers = signal<string[]>([]);
```

### Canvas Renderer

`CanvasRendererService` handles all photo strip rendering:

- Computes layout positions dynamically
- Applies CSS filters via `ctx.filter`
- Draws polaroid frames, dot patterns, watermark
- Supports all 4 layout configurations

### Components (Standalone)

All components use Angular 17 standalone API — no `NgModule` needed.

---

## 🔒 Privacy

All photo processing is done entirely client-side using the **Canvas API**.  
No images are ever sent to a server.
