/**
 * components/business/PrintWrapper.jsx
 * Wraps a printable invoice/document for A4 output.
 * Handles the no-print / print CSS boundary.
 * Server-safe.
 *
 * Props:
 *   children   — the invoice document content
 *   id?        — element id for the wrapper (default: "invoice-print")
 *   className? — extra classes on the outer wrapper
 */
export default function PrintWrapper({ children, id = "invoice-print", className = "" }) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-300 bg-white shadow-xl print:shadow-none print:border-0 print:rounded-none print:m-0 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
