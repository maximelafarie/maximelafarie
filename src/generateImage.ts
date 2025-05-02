import { createCanvas, registerFont, CanvasRenderingContext2D as CanvasCtx2D } from 'canvas';
import { writeFileSync } from 'fs';
import path from 'path';

interface TextImageOptions {
  text: string;
  fontPath?: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  outputPath: string;
  padding?: number;
  maxWidth?: number;
  customLineHeight?: number;
}


function wrapText(ctx: CanvasCtx2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\r?\n/);

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + word + ' ';
      const { width: testWidth } = ctx.measureText(testLine);
      if (testWidth > maxWidth && line !== '') {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line.trim());
  }

  return lines;
}

export function textToPngImage({
  text,
  fontPath,
  fontFamily,
  fontSize,
  color,
  outputPath,
  padding = 20,
  maxWidth = 800,
  customLineHeight = 1.2
}: TextImageOptions): void {
  if (fontPath) {
    registerFont(path.resolve(fontPath), { family: fontFamily });
  }

  const tempCanvas = createCanvas(0, 0);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = `${fontSize}px ${fontFamily}`;
  const lines = wrapText(tempCtx, text, maxWidth);

  const lineHeight = fontSize * (customLineHeight ?? 1.4);
  const height = lines.length * lineHeight + padding * 2;

  const canvas = createCanvas(maxWidth + padding * 2, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';

  lines.forEach((line, i) => {
    ctx.fillText(line, padding, padding + i * lineHeight);
  });

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(path.resolve(outputPath), buffer);
}
