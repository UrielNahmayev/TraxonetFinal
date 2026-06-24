// TRAXONET — Project Book (per Israeli Ministry of Education guidelines)
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents, ImageRun,
} = require('docx');

const PROJECT_ROOT = "C:\\Users\\USER\\source\\repos\\TraxonetFinal";
const SCREENSHOTS_DIR = "C:\\Users\\USER\\Desktop\\TraxonetScreenshots";

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

const LRM = '‎';
const FSI = '⁨';
const PDI = '⁩';

function bidiIsolate(text) {
  // Return text as-is - FSI/PDI marks render as visible boxes in many fonts
  // Rely on document-level RTL settings + paragraph bidirectional instead
  return text;
}

function h(text, level) {
  const sizes = { 1: 44, 2: 36, 3: 28, 4: 24 };
  const colors = { 1: "C00000", 2: "1F3864", 3: "2E75B6", 4: "404040" };
  const levels = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
  return new Paragraph({
    heading: levels[level],
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { before: level === 1 ? 480 : 280, after: level === 1 ? 240 : 140 },
    children: [new TextRun({ text: bidiIsolate(text), bold: true, size: sizes[level], font: "Arial", color: colors[level], rightToLeft: true })],
  });
}

function he(text, opts = {}) {
  const runs = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end > 0) {
        runs.push(new TextRun({ text: bidiIsolate(text.slice(i + 2, end)), bold: true, size: 22, font: "Arial", rightToLeft: true }));
        i = end + 2; continue;
      }
      runs.push(new TextRun({ text: '**', size: 22, font: "Arial", rightToLeft: true }));
      i += 2; continue;
    }
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > 0) {
        runs.push(new TextRun({ text: FSI + text.slice(i + 1, end) + PDI, font: "Courier New", size: 20, color: "C00000" }));
        i = end + 1; continue;
      }
      runs.push(new TextRun({ text: '`', size: 22, font: "Arial", rightToLeft: true }));
      i += 1; continue;
    }
    let next = text.length;
    for (const m of ['**', '`']) { const p = text.indexOf(m, i); if (p > i && p < next) next = p; }
    if (next <= i) next = text.length;
    runs.push(new TextRun({ text: bidiIsolate(text.slice(i, next)), size: 22, font: "Arial", rightToLeft: true }));
    i = next;
  }
  return new Paragraph({
    bidirectional: true,
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.RIGHT,
    spacing: { after: opts.tight ? 60 : 140, line: 320 },
    children: runs,
  });
}

function code(text) {
  const lines = text.split('\n');
  return lines.map((line, idx) => new Paragraph({
    spacing: { before: idx === 0 ? 120 : 0, after: idx === lines.length - 1 ? 120 : 0, line: 260 },
    shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
    bidirectional: false,
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: line || ' ', font: "Courier New", size: 18, rightToLeft: false })],
  }));
}

function spacer() { return new Paragraph({ spacing: { after: 120 }, children: [new TextRun(" ")] }); }
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function loadImg(name) {
  try {
    const fullPath = path.join(SCREENSHOTS_DIR, name);
    return fs.readFileSync(fullPath);
  } catch (e) { return null; }
}

function image(name, caption, width = 480, height = 300) {
  const data = loadImg(name);
  const items = [];
  if (data) {
    items.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({
        type: "png", data,
        transformation: { width, height },
        altText: { title: caption, description: caption, name: caption },
      })],
    }));
  } else {
    items.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
      children: [new TextRun({ text: `[צילום מסך: ${caption}]`, size: 22, font: "Arial", bold: true, color: "9C5700" })],
    }));
  }
  items.push(new Paragraph({
    bidirectional: true, alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: bidiIsolate(`איור: ${caption}`), italics: true, size: 20, font: "Arial", color: "595959", rightToLeft: true })],
  }));
  return items;
}

function diagram(text) {
  const lines = text.split('\n');
  return [
    new Paragraph({
      shading: { fill: "EAF1F8", type: ShadingType.CLEAR },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }, left: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }, right: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" } },
      spacing: { before: 120, after: 60 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: " ", size: 4 })],
    }),
    ...lines.map(line => new Paragraph({
      spacing: { line: 240 },
      alignment: AlignmentType.CENTER,
      shading: { fill: "EAF1F8", type: ShadingType.CLEAR },
      children: [new TextRun({ text: line || ' ', font: "Courier New", size: 18, color: "1F3864" })],
    })),
    new Paragraph({
      shading: { fill: "EAF1F8", type: ShadingType.CLEAR },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }, left: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" }, right: { style: BorderStyle.SINGLE, size: 4, color: "1F3864" } },
      spacing: { before: 60, after: 200 },
      children: [new TextRun({ text: " ", size: 4 })],
    }),
  ];
}

function infoBox(label, text, color = "D9E2F3") {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: BORDERS, shading: { fill: color, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [
          new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { after: 80 },
            children: [new TextRun({ text: label, bold: true, size: 24, font: "Arial", color: "1F3864", rightToLeft: true })] }),
          he(text, { tight: true }),
        ],
      })],
    })],
  });
}

function tbl2col(headerA, headerB, rows) {
  const headCell = (text) => new TableCell({
    borders: BORDERS, shading: { fill: "1F3864", type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: "FFFFFF", rightToLeft: true })] })],
  });
  const bodyCell = (text) => new TableCell({
    borders: BORDERS, margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: bidiIsolate(text), size: 22, font: "Arial", rightToLeft: true })] })],
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 6240],
    rows: [
      new TableRow({ children: [headCell(headerA), headCell(headerB)] }),
      ...rows.map(r => new TableRow({ children: [bodyCell(r[0]), bodyCell(r[1])] })),
    ],
  });
}

// Flow mockup — nice colored boxes connected with arrows
// boxes: array of { text, color, role }
function flowBox(boxes, opts = {}) {
  const items = [];
  const colors = {
    client: { fill: "FFE699", border: "BF8F00", text: "7F6000" },
    server: { fill: "C6E0B4", border: "548235", text: "375623" },
    db:     { fill: "F4B084", border: "C65911", text: "843C0C" },
    web:    { fill: "B4C7E7", border: "2E75B6", text: "1F3864" },
    user:   { fill: "FFD8E4", border: "D05A8B", text: "8B2C5E" },
    process:{ fill: "E2EFDA", border: "70AD47", text: "375623" },
    default:{ fill: "DEEBF7", border: "2E75B6", text: "1F3864" },
  };
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const c = colors[box.role || 'default'];
    items.push(new Table({
      width: { size: 7200, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      columnWidths: [7200],
      rows: [new TableRow({
        children: [new TableCell({
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 16, color: c.border },
            bottom: { style: BorderStyle.SINGLE, size: 16, color: c.border },
            left:   { style: BorderStyle.SINGLE, size: 16, color: c.border },
            right:  { style: BorderStyle.SINGLE, size: 16, color: c.border },
          },
          shading: { fill: c.fill, type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          children: [
            box.title ? new Paragraph({
              bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 60 },
              children: [new TextRun({ text: box.title, bold: true, size: 24, font: "Arial", color: c.text, rightToLeft: true })],
            }) : null,
            new Paragraph({
              bidirectional: true, alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: bidiIsolate(box.text), size: 22, font: "Arial", color: c.text, rightToLeft: true })],
            }),
          ].filter(x => x !== null),
        })],
      })],
    }));
    // Arrow between boxes (except after last)
    if (i < boxes.length - 1) {
      items.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text: "▼", size: 32, color: "808080", font: "Arial" })],
      }));
    }
  }
  return items;
}

// Side-by-side mockup — multiple boxes in a row
function flowRow(boxes) {
  const colors = {
    client: { fill: "FFE699", border: "BF8F00", text: "7F6000" },
    server: { fill: "C6E0B4", border: "548235", text: "375623" },
    db:     { fill: "F4B084", border: "C65911", text: "843C0C" },
    web:    { fill: "B4C7E7", border: "2E75B6", text: "1F3864" },
    default:{ fill: "DEEBF7", border: "2E75B6", text: "1F3864" },
  };
  const totalWidth = 9360;
  const colWidth = Math.floor(totalWidth / boxes.length);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: boxes.map(() => colWidth),
    rows: [new TableRow({
      children: boxes.map(box => {
        const c = colors[box.role || 'default'];
        return new TableCell({
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 12, color: c.border },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: c.border },
            left:   { style: BorderStyle.SINGLE, size: 12, color: c.border },
            right:  { style: BorderStyle.SINGLE, size: 12, color: c.border },
          },
          shading: { fill: c.fill, type: ShadingType.CLEAR },
          margins: { top: 150, bottom: 150, left: 100, right: 100 },
          children: [
            box.title ? new Paragraph({
              bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 40 },
              children: [new TextRun({ text: box.title, bold: true, size: 20, font: "Arial", color: c.text, rightToLeft: true })],
            }) : null,
            new Paragraph({
              bidirectional: true, alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: bidiIsolate(box.text), size: 18, font: "Arial", color: c.text, rightToLeft: true })],
            }),
          ].filter(x => x !== null),
        });
      }),
    })],
  });
}

// Stat card - large number with label
function statCard(label, value, color = "1F3864") {
  return new Table({
    width: { size: 4500, type: WidthType.DXA },
    columnWidths: [4500],
    alignment: AlignmentType.CENTER,
    rows: [new TableRow({
      children: [new TableCell({
        borders: BORDERS,
        shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [
          new Paragraph({
            bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 40 },
            children: [new TextRun({ text: bidiIsolate(value), bold: true, size: 56, font: "Arial", color })],
          }),
          new Paragraph({
            bidirectional: true, alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: label, size: 20, font: "Arial", color: "595959", rightToLeft: true })],
          }),
        ],
      })],
    })],
  });
}

const content = [];
const push = (...items) => items.forEach(i => Array.isArray(i) ? i.forEach(x => content.push(x)) : content.push(i));

module.exports = { content, push, h, he, code, spacer, pageBreak, image, diagram, flowBox, flowRow, statCard, infoBox, tbl2col, bidiIsolate,
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, TableOfContents, ImageRun, BORDERS, LRM, FSI, PDI, PROJECT_ROOT, SCREENSHOTS_DIR, loadImg };
