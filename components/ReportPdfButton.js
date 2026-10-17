"use client";

// Saves the brand AI report as a PDF through the browser's print dialog
// (Save as PDF). Opens every folded answer first so the PDF has them in
// full, and names the file after the brand.
export default function ReportPdfButton({ brand, className }) {
  function save() {
    const folded = [...document.querySelectorAll(".rp details:not([open])")];
    folded.forEach((d) => (d.open = true));
    const title = document.title;
    document.title = `${brand} AI report - AEOrank`;
    window.print();
    document.title = title;
    folded.forEach((d) => (d.open = false));
  }
  return (
    <button type="button" onClick={save} className={className}>
      Download PDF
    </button>
  );
}
