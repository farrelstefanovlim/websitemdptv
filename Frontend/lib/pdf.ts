import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  summaryRows?: { label: string; value: string }[];
}

export const exportToPDF = ({
  title,
  subtitle,
  headers,
  rows,
  filename,
  summaryRows,
}: PDFExportOptions) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header MDPTV Branding
  doc.setFillColor(15, 23, 42); // Primary dark slate
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MDPTV STUDIO", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title.toUpperCase(), 14, 23);

  const timestampStr = `Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(timestampStr, 196, 23, { align: "right" });

  let startY = 36;

  if (subtitle) {
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(subtitle, 14, startY);
    startY += 8;
  }

  // Summary box if provided
  if (summaryRows && summaryRows.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    const boxHeight = 8 + summaryRows.length * 6;
    doc.roundedRect(14, startY, 182, boxHeight, 3, 3, "FD");

    let currentSumY = startY + 6;
    summaryRows.forEach((item) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(item.label, 18, currentSumY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 118, 110);
      doc.text(item.value, 190, currentSumY, { align: "right" });
      currentSumY += 6;
    });

    startY += boxHeight + 8;
  }

  // Table
  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 118, 110], // Teal secondary header
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Halaman ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 196, 287, { align: "right" });
      doc.text("Laporan Resmi MDPTV", 14, 287);
    },
  });

  doc.save(`${filename}.pdf`);
};
