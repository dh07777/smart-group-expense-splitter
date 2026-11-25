export const Modal = ({ title, onClose, children }) => (<div className="ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal"><div className="mh"><h3>{title}</h3><button className="x" onClick={onClose}>✕</button></div>{children}</div></div>);
export const Field = ({ label, error, children }) => (<label className="f"><span>{label}</span>{children}{error && <em>{error}</em>}</label>);
export const Stat = ({ icon, label, value, tone }) => (<div className={'card stat ' + (tone || '')}><div className="ic">{icon}</div><div><small>{label}</small><b>{value}</b></div></div>);
const COL = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7', '#ec4899', '#64748b'];
export const Donut = ({ items, fmt }) => {
    const tot = items.reduce((s, i) => s + i.value, 0), t = tot || 1, R = 40, C = 2 * Math.PI * R; let a = 0;
    return (<div className="donut"><svg viewBox="0 0 100 100" width="170" height="170"><g transform="rotate(-90 50 50)">{items.map((i, k) => { const l = i.value / t * C; const el = <circle key={i.label} cx="50" cy="50" r={R} fill="none" stroke={COL[k % 8]} strokeWidth="16" strokeDasharray={`${l} ${C - l}`} strokeDashoffset={-a} />; a += l; return el })}</g><text x="50" y="52" textAnchor="middle" fontSize="7" fill="currentColor">{fmt(tot)}</text></svg>
        <div className="leg">{items.map((i, k) => <div key={i.label}><i style={{ background: COL[k % 8] }} />{i.label} <b>{Math.round(i.value / t * 100)}%</b></div>)}</div></div>)
};
export const Empty = ({ text }) => <div className="empty">{text}</div>;
export const Bars = ({ items, fmt }) => { const m = Math.max(1, ...items.map(i => i.value)); return (<div className="bars">{items.map(i => (<div key={i.label} className="bc" title={fmt(i.value)}><span className="bv">{fmt(i.value)}</span><div className="bar" style={{ height: Math.max(3, i.value / m * 100) + '%' }} /><small>{i.label}</small></div>))}</div>) };
export const HBars = ({ items, fmt }) => { const m = Math.max(1, ...items.map(i => i.value)); return (<div>{items.map(i => (<div key={i.label} className="hb"><span>{i.label}</span><div className="track"><div style={{ width: i.value / m * 100 + '%' }} /></div><b>{fmt(i.value)}</b></div>))}</div>) };
