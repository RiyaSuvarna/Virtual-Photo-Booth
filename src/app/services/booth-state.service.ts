import { Injectable, signal, computed } from '@angular/core';

export type LayoutId = 'vertical' | 'grid' | 'wide' | 'polaroid';
export type FilterId = 'none' | 'bw' | 'sepia' | 'vivid' | 'fade' | 'dramatic' | 'warm' | 'cool' | 'retro';
export type BorderId = 'none' | 'thin' | 'thick' | 'round' | 'shadow';

export interface Layout {
  id: LayoutId;
  name: string;
  desc: string;
  lpClass: string;
}

export interface Filter {
  id: FilterId;
  label: string;
  cssFilter: string;
}

export const LAYOUTS: Layout[] = [
  { id: 'vertical', name: 'Classic Strip',  desc: '4 photos stacked vertically',  lpClass: 'v4' },
  { id: 'grid',     name: '2 × 2 Grid',    desc: '4 photos in a square grid',    lpClass: 'g22' },
  { id: 'wide',     name: 'Wide Strip',    desc: '4 photos side by side',        lpClass: 'h4' },
  { id: 'polaroid', name: 'Polaroid',      desc: '4 polaroid-style frames',      lpClass: 'pol' },
];

export const FILTERS: Filter[] = [
  { id: 'none',     label: 'Original', cssFilter: '' },
  { id: 'bw',       label: 'B&W',      cssFilter: 'grayscale(1)' },
  { id: 'sepia',    label: 'Sepia',    cssFilter: 'sepia(0.9)' },
  { id: 'vivid',    label: 'Vivid',    cssFilter: 'saturate(2) contrast(1.1)' },
  { id: 'fade',     label: 'Fade',     cssFilter: 'opacity(0.75) contrast(0.85) brightness(1.2)' },
  { id: 'dramatic', label: 'Dramatic', cssFilter: 'contrast(1.45) brightness(0.88)' },
  { id: 'warm',     label: 'Warm',     cssFilter: 'sepia(0.35) saturate(1.5) brightness(1.05)' },
  { id: 'cool',     label: 'Cool',     cssFilter: 'hue-rotate(200deg) saturate(1.3)' },
  { id: 'retro',    label: 'Retro',    cssFilter: 'sepia(0.5) saturate(0.75) contrast(1.25)' },
];

export const BG_COLORS = [
  '#ffffff','#f5f0e8','#f0ede0','#0e0e0e',
  '#1a1a2e','#f5c842','#e8a4c8','#7dd3fc',
  '#86efac','#fecaca','#c4b5fd','#fb923c',
];

export const BORDERS: { id: BorderId; label: string }[] = [
  { id: 'none',   label: 'None' },
  { id: 'thin',   label: 'Thin' },
  { id: 'thick',  label: 'Thick' },
  { id: 'round',  label: 'Round' },
  { id: 'shadow', label: 'Shadow' },
];

export const STICKERS = [
  '✨','💫','🎉','❤️','🌸','⭐','🦋','🎈',
  '🌈','🤍','🔥','😊','🥰','🎀','🌟','🫧','🍀','🫶',
];

@Injectable({ providedIn: 'root' })
export class BoothStateService {
  step    = signal<number>(1);
  layout  = signal<LayoutId>('vertical');
  shots   = signal<string[]>([]);
  filter  = signal<FilterId>('none');
  bgColor = signal<string>('#ffffff');
  border  = signal<BorderId>('none');
  stickers = signal<string[]>([]);

  allShotsTaken = computed(() => this.shots().length >= 4);

  setStep(n: number)    { this.step.set(n); }
  setLayout(id: LayoutId) { this.layout.set(id); }
  setFilter(id: FilterId) { this.filter.set(id); }
  setBgColor(c: string)   { this.bgColor.set(c); }
  setBorder(id: BorderId) { this.border.set(id); }
  addShot(dataUrl: string) {
    if (this.shots().length < 4) this.shots.update(arr => [...arr, dataUrl]);
  }
  addSticker(s: string) { this.stickers.update(arr => [...arr, s]); }
  resetShots()  { this.shots.set([]); }
  resetAll() {
    this.step.set(1);
    this.shots.set([]);
    this.filter.set('none');
    this.bgColor.set('#ffffff');
    this.border.set('none');
    this.stickers.set([]);
  }
}
