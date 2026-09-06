import FieldToken from "./FieldToken";

function renderParts(parts, fieldValues, onSetField) {
  return parts.map((part, i) =>
    part.type === "text" ? (
      <span key={i}>{part.value}</span>
    ) : (
      <FieldToken
        key={part.id}
        id={part.id}
        ph={part.ph}
        multi={part.multi}
        optional={part.optional}
        value={fieldValues[part.id]}
        onSetField={onSetField}
      />
    )
  );
}

export default function SoapRow({ letter, name, parts, steps, fieldValues, onSetField }) {
  return (
    <div className="soap-row">
      <div className="soap-letter">{letter}</div>
      <div className="soap-body">
        <div className="soap-name">{name}</div>
        <div className="soap-text">
          {steps ? (
            <ul>
              {steps.map((stepParts, i) => (
                <li key={i}>{renderParts(stepParts, fieldValues, onSetField)}</li>
              ))}
            </ul>
          ) : (
            renderParts(parts, fieldValues, onSetField)
          )}
        </div>
      </div>
    </div>
  );
}
