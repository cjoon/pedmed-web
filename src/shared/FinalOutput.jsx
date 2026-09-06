import { useEffect, useState } from "react";

// Step 3 of the fill → edit → final flow: the confirmed text, read-only, with
// Copy (and Print where the caller asks for it — the Rx tab). The copy toast
// lives here so both tabs get identical behavior.
export default function FinalOutput({ text, onBack, printable = false, title }) {
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!status) return undefined;
    const t = setTimeout(() => setStatus(""), 2000);
    return () => clearTimeout(t);
  }, [status]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to clipboard");
    } catch {
      setStatus("Copy failed — select the text and copy manually");
    }
  }

  return (
    <div className="final-output">
      {title && <div className="step-title">{title}</div>}
      <pre className={`final-text${printable ? " print-area" : ""}`}>{text}</pre>
      <div className="step-actions">
        <button type="button" className="step-btn" onClick={onBack}>
          ← Edit
        </button>
        {printable && (
          <button type="button" className="step-btn" onClick={() => window.print()}>
            Print
          </button>
        )}
        <button type="button" className="step-btn primary" onClick={handleCopy}>
          Copy
        </button>
      </div>
      {status && <div className="toast">{status}</div>}
    </div>
  );
}
