import { getRegionContent } from '../regionContent'

export default function RegionOverviewCard({ moduleKey, regionId, regionName }) {
  const content = getRegionContent(moduleKey, regionId)
  if (!content) return null

  return (
    <div className="region-overview" style={{ '--region-accent': content.color }}>
      <div className="region-overview-header">
        <div className="region-overview-badge" style={{ backgroundColor: content.color }}>
          {regionName}
        </div>
        <p className="region-overview-desc">{content.description}</p>
      </div>

      <div className="region-overview-corporations">
        <h4 className="region-overview-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Corporaciones de Turismo
        </h4>
        <div className="region-overview-chips">
          {content.corporations.map((c, i) => (
            <span key={i} className="region-corp-chip" style={{ borderColor: content.color, color: content.color }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="region-overview-body">
        <h4 className="region-overview-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          {content.title}
        </h4>
        <ul className="region-overview-list">
          {content.items.map((item, i) => (
            <li key={i} className="region-overview-item">
              <span className="region-item-dot" style={{ backgroundColor: content.color }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
