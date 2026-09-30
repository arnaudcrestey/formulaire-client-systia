import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { briefSections, type ClientBrief } from "@/lib/point-de-depart";

const ink = rgb(0.10, 0.14, 0.12);
const bronze = rgb(0.50, 0.39, 0.22);
const muted = rgb(0.40, 0.44, 0.40);
const line = rgb(0.84, 0.82, 0.76);
const width = 595.28;
const height = 841.89;
const margin = 50;

function safeText(value: string) {
  return value.replace(/\u202f/g, " ").replace(/\u2011/g, "-").replace(/\u2026/g, "...").replace(/[\u{10000}-\u{10ffff}]/gu, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) { current = candidate; continue; }
    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) { current = word; continue; }
    let part = "";
    for (const character of word) {
      if (font.widthOfTextAtSize(part + character, size) > maxWidth && part) { lines.push(part); part = character; }
      else part += character;
    }
    current = part;
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["À définir"];
}

export async function createBriefPdf(data: ClientBrief): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const serif = await document.embedFont(StandardFonts.TimesRoman);
  let page: PDFPage = document.addPage([width, height]);
  let y = height - margin;

  const nextPage = () => { page = document.addPage([width, height]); y = height - margin; };
  const ensure = (needed: number) => { if (y - needed < margin + 28) nextPage(); };

  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "brand", "ac.png"));
    const logo = await document.embedPng(logoBytes);
    page.drawImage(logo, { x: width - margin - 110, y: height - margin - 62, width: 110, height: 58 });
  } catch { /* Le nom AC reste présent si l'image n'est pas disponible. */ }

  page.drawText("AC · ARNAUD CRESTEY", { x: margin, y, size: 10, font: bold, color: bronze });
  y -= 39;
  page.drawText("Votre point de départ", { x: margin, y, size: 29, font: serif, color: ink });
  y -= 26;
  const contactLines = wrap(`${data.prenom} ${data.nom} · ${data.email}`, regular, 10, width - 2 * margin);
  contactLines.forEach((item, index) => page.drawText(item, { x: margin, y: y - index * 14, size: 10, font: regular, color: muted }));
  y -= 25 + (contactLines.length - 1) * 14;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: line });
  y -= 28;

  for (const section of briefSections(data)) {
    ensure(55);
    page.drawText(safeText(section.title), { x: margin, y, size: 17, font: serif, color: ink });
    y -= 25;
    for (const [label, value] of section.rows) {
      const valueLines = wrap(value, regular, 10, width - 2 * margin - 160);
      const rowHeight = Math.max(21, valueLines.length * 14 + 5);
      ensure(rowHeight + 5);
      page.drawText(safeText(label), { x: margin, y, size: 9, font: bold, color: bronze, maxWidth: 145 });
      valueLines.forEach((item, index) => page.drawText(item, { x: margin + 160, y: y - index * 14, size: 10, font: regular, color: ink }));
      y -= rowHeight;
    }
    y -= 13;
  }

  const pages = document.getPages();
  pages.forEach((item, index) => {
    item.drawLine({ start: { x: margin, y: 38 }, end: { x: width - margin, y: 38 }, thickness: .6, color: line });
    item.drawText("Document de préparation · choix à confirmer ensemble", { x: margin, y: 24, size: 8, font: regular, color: muted });
    item.drawText(`${index + 1} / ${pages.length}`, { x: width - margin - 22, y: 24, size: 8, font: regular, color: muted });
  });
  return document.save();
}
