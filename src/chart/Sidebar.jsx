// Procedure list shared by the Chart and Visit Note tabs. `templates` decides
// which set is listed; a procedure's sub-entries are `versions` on the Chart
// tab and `visits` on the Visit Note tab, so the pill row reads whichever is
// present. Every procedure has at least one, so the first is the default.
function subEntries(item) {
  return item.versions ?? item.visits ?? [];
}

export default function Sidebar({ templates, search, onSearch, active, onSelect, className = "" }) {
  return (
    <aside className={`sidebar ${className}`.trim()}>
      <div className="search-wrap">
        <input
          type="text"
          placeholder="Search procedures…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <nav className="proc-list">
        {Object.entries(templates).map(([catKey, cat]) => {
          const q = search.toLowerCase();
          const matches = Object.entries(cat.items).filter(
            ([, item]) => item.name.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
          );
          if (!matches.length) return null;
          return (
            <div key={catKey}>
              <div className="cat-label">{cat.label}</div>
              {matches.map(([key, item]) => {
                const isActive = active?.catKey === catKey && active?.key === key;
                const entries = subEntries(item);
                return (
                  <div key={key}>
                    <div
                      className={`proc-item${isActive ? " active" : ""}`}
                      onClick={() => onSelect(catKey, key, entries[0].id)}
                    >
                      <span>{item.name}</span>
                      <span className="tag">{item.tag}</span>
                    </div>
                    {isActive && entries.length > 1 && (
                      <div className="ver-list">
                        {entries.map((ver) => (
                          <span
                            key={ver.id}
                            className={`ver-pill${active.versionId === ver.id ? " active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(catKey, key, ver.id);
                            }}
                          >
                            {ver.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
