// Step 2 of the fill → edit → final flow shared by the Chart and Rx tabs:
// a plain textarea holding the generated draft so it can be reworded freely
// before it is finalized. Deliberately dumb — the parent owns the text.
export default function DraftEditor({ text, onChange, onBack, onDone, title, hint }) {
  return (
    <div className="draft-editor">
      {title && <div className="step-title">{title}</div>}
      <textarea
        className="draft-textarea"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      {hint && <p className="step-hint">{hint}</p>}
      <div className="step-actions">
        <button type="button" className="step-btn" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="step-btn primary" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
