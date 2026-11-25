import { useState, useEffect, useCallback } from 'react';
import { Ctx, useLS, demo } from './store.js';
import { Modal } from './ui.jsx';
import Dashboard from './Dashboard.jsx'; import Groups from './Groups.jsx'; import Expenses from './Expenses.jsx';
import Settle from './Settle.jsx'; import Reports from './Reports.jsx'; import Settings from './Settings.jsx';
const NAV = [['dash', '📊', 'Dashboard', Dashboard], ['groups', '👥', 'Groups', Groups], ['exp', '🧾', 'Expenses', Expenses], ['settle', '🤝', 'Settlements', Settle], ['rep', '📈', 'Reports', Reports], ['set', '⚙️', 'Settings', Settings]];
export default function App() {
    const [data, setData] = useLS('splitmate-v1', demo); const [page, setPage] = useState(() => NAV.some(n => '#' + n[0] === location.hash) ? location.hash.slice(1) : 'dash'); const [menu, setMenu] = useState(false);
    const [conf, setConf] = useState(null); const [tst, setTst] = useState('');
    useEffect(() => { document.documentElement.dataset.theme = data.settings.theme }, [data.settings.theme]);
    useEffect(() => { const h = () => NAV.some(n => '#' + n[0] === location.hash) && setPage(location.hash.slice(1)); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, []);
    const fmt = useCallback(n => new Intl.NumberFormat(undefined, { style: 'currency', currency: data.settings.currency }).format(n || 0), [data.settings.currency]);
    const toast = m => { setTst(m); setTimeout(() => setTst(''), 2200) };
    const ctx = { data, setData, fmt, toast, ask: (msg, fn) => setConf({ msg, fn }), go: k => { location.hash = k; setPage(k) } };
    const Page = NAV.find(n => n[0] === page)[3];
    return (<Ctx.Provider value={ctx}><div className="app">
        <aside className={'side' + (menu ? ' open' : '')}><div className="logo">💸 SplitMate</div>
            {NAV.map(([k, i, l]) => (<button key={k} className={'nav' + (page === k ? ' on' : '')} onClick={() => { location.hash = k; setPage(k); setMenu(false) }}><span>{i}</span>{l}</button>))}
            <div className="me"><div className="av">{data.settings.name[0]?.toUpperCase()}</div><div><b>{data.settings.name}</b><small>{data.settings.email}</small></div></div></aside>
        {menu && <div className="scrim" onClick={() => setMenu(false)} />}
        <main><header className="top"><button className="burger" onClick={() => setMenu(true)}>☰</button><h2>{NAV.find(n => n[0] === page)[2]}</h2>
            <button className="btn ghost" onClick={() => setData(d => ({ ...d, settings: { ...d.settings, theme: d.settings.theme === 'dark' ? 'light' : 'dark' } }))}>{data.settings.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button></header>
            <div className="page" key={page}><Page /></div></main>
        {conf && <Modal title="Please confirm" onClose={() => setConf(null)}><p>{conf.msg}</p><div className="row end"><button className="btn ghost" onClick={() => setConf(null)}>Cancel</button><button className="btn danger" onClick={() => { conf.fn(); setConf(null) }}>Confirm</button></div></Modal>}
        {tst && <div className="toast">{tst}</div>}</div></Ctx.Provider>)
}
