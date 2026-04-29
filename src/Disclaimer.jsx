export default function Disclaimer({ onAccept }) {
  function handleDecline() {
    window.location.href = "about:blank";
  }

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <h1 className="disclaimer-title">PedMed Dosage Calculator</h1>
        <p className="disclaimer-sub">Important Notice — Please Read Before Proceeding</p>

        <div className="disclaimer-blocks">
          <DisclaimerBlock icon="⚕️" title="For Reference Only">
            This tool provides dosage estimates based on published pediatric guidelines. It does
            not replace clinical judgment or professional evaluation.
          </DisclaimerBlock>
          <DisclaimerBlock icon="👨‍⚕️" title="Consult a Provider">
            Always verify calculated doses with a licensed healthcare provider before
            administering any medication.
          </DisclaimerBlock>
          <DisclaimerBlock icon="📋" title="Clinical Guidelines">
            Dosing references are based on the AAPD Reference Manual 2025–2026 and standard
            pediatric pharmacology references.
          </DisclaimerBlock>
          <DisclaimerBlock icon="⚠️" title="No Liability">
            The developers of this application assume no liability for clinical decisions made
            using this tool.
          </DisclaimerBlock>
          <DisclaimerBlock icon="🔒" title="No Data Stored">
            No patient information is transmitted or stored. All calculations occur locally in
            your browser.
          </DisclaimerBlock>
        </div>

        <div className="disclaimer-actions">
          <button className="btn-accept" onClick={onAccept}>
            I Understand — Continue
          </button>
          <button className="btn-decline" onClick={handleDecline}>
            Decline &amp; Exit
          </button>
        </div>
      </div>
    </div>
  );
}

function DisclaimerBlock({ icon, title, children }) {
  return (
    <div className="disclaimer-block">
      <span className="disclaimer-icon">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
