// TRAXONET — Project Book (Ministry of Education guidelines)
// Main runner — pulls all sections together
const fs = require('fs');
const H = require('./helpers');
const {
  content, push, h, he, code, spacer, pageBreak, image, diagram, infoBox, tbl2col, bidiIsolate,
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, TableOfContents,
  ImageRun, BORDERS, LRM, FSI, PDI, PROJECT_ROOT, SCREENSHOTS_DIR, loadImg
} = H;

// ===== COVER =====
push(
  new Paragraph({ spacing: { before: 1800, after: 300 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "TRAXONET", bold: true, size: 110, font: "Arial", color: "C00000" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: "ספר הפרויקט", bold: true, size: 48, font: "Arial", color: "1F3864" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: "מערכת ניטור מרחוק של מחשבים", size: 32, font: "Arial", color: "595959", rightToLeft: true })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: "מוגש על-ידי: אוריאל נחמייב", size: 26, font: "Arial", bold: true, rightToLeft: true })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 1200 },
    children: [new TextRun({ text: "כיתת מגמת מדעי המחשב — פרויקט גמר", size: 24, font: "Arial", rightToLeft: true })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: bidiIsolate("פרויקט גמר בפיתוח תוכנה — .NET 8 / C# / MySQL"), size: 22, font: "Arial", italics: true, color: "595959", rightToLeft: true })] }),
  pageBreak()
);

// ===== TOC =====
push(
  h("תוכן עניינים", 1),
  new Paragraph({ children: [new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-3" })] }),
  pageBreak()
);

// Load sections from separate files (will be added)
const sections = ['sec1_intro', 'sec2_arch', 'sec3_impl', 'sec4_user', 'sec5_reflect', 'sec_journal', 'sec_decisions', 'sec_extras', 'sec_extras2', 'sec_final', 'sec6_biblio', 'sec7_appendix'];
for (const s of sections) {
  const file = `./${s}.js`;
  if (fs.existsSync(`${__dirname}/${s}.js`)) {
    require(file);
  }
}

// ===== BUILD AND EXPORT =====
const doc = new Document({
  creator: "TRAXONET Project Book",
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22, rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT },
      },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 44, bold: true, font: "Arial", color: "C00000", rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { before: 480, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1F3864", rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { before: 360, after: 200 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6", rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { before: 280, after: 140 }, outlineLevel: 2 } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "404040", rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { before: 200, after: 100 }, outlineLevel: 3 } },
      { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, font: "Arial", rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { after: 60 } } },
      { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 20, font: "Arial", rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT, indent: { right: 240 }, spacing: { after: 60 } } },
      { id: "TOC3", name: "toc 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 20, font: "Arial", rightToLeft: true },
        paragraph: { bidirectional: true, alignment: AlignmentType.RIGHT, indent: { right: 480 }, spacing: { after: 60 } } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true,
          children: [new TextRun({ text: "TRAXONET — ספר הפרויקט", color: "808080", size: 18, font: "Arial", rightToLeft: true })] })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "עמוד ", size: 18, font: "Arial", color: "808080", rightToLeft: true }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "808080" })] })],
      }),
    },
    children: content,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const outPath = "C:\\Users\\USER\\Desktop\\TRAXONET_ספר_הפרויקט.docx";
  fs.writeFileSync(outPath, buf);
  console.log("Written:", outPath, "Size:", (buf.length / 1024).toFixed(1) + " KB", "Items:", content.length);
});
