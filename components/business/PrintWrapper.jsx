/**
 * components/business/PrintWrapper.jsx
 * Ink & Signal: wraps a printable invoice/document for A4 output.
 * Handles the no-print / print CSS boundary.
 * Server-safe.
 *
 * Props (unchanged): children, id?, className?
 */
export default function PrintWrapper({ children, id = "invoice-print", className = "" }) {
  return (
    <div id={id} className={`pw-sheet ${className}`}>
      <PrintWrapperStyles />
      {children}
    </div>
  );
}

function PrintWrapperStyles() {
  return (
    <style>{`
      /* Screen: the document is always a white paper sheet, even in dark mode,
         so the preview matches what prints. */
      .pw-sheet{
        background:#ffffff; color:#0a0a0a;
        border:2px solid #0a0a0a;
        overflow:hidden;
      }

      @page{ size:A4; margin:12mm; }

      @media print{
        .pw-sheet{
          border:0; margin:0; padding:0; overflow:visible;
          -webkit-print-color-adjust:exact; print-color-adjust:exact;
        }
        .pw-sheet table,
        .pw-sheet tr,
        .pw-sheet img{ break-inside:avoid; }
      }
    `}</style>
  );
}