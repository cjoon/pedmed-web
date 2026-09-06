import { FACTORY_TEMPLATES } from "./data/initialTemplates";

export default function Sidebar({ search, onSearch, active, onSelect, className = "" }) {
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
        {Object.entries(FACTORY_TEMPLATES).map(([catKey, cat]) => {
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
                return (
                  <div key={key}>
                    <div
                      className={`proc-item${isActive ? " active" : ""}`}
                      onClick={() => onSelect(catKey, key, item.versions[0].id)}
                    >
                      <span>{item.name}</span>
                      <span className="tag">{item.tag}</span>
                    </div>
                    {isActive && item.versions.length > 1 && (
                      <div className="ver-list">
                        {item.versions.map((ver) => (
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
