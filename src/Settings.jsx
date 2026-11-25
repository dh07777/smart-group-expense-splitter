import { useState } from 'react';
import { useApp, CUR, demo } from './store.js';
import { Field } from './ui.jsx';
export default function Settings() {
    const { data, setData, ask, toast } = useApp(); const s = data.settings; const [p, setP] = useState({ name: s.name, email: s.email }); const [err, setErr] = useState({});
    const upd = o => setData(d => ({ ...d, settings: { ...d.settings, ...o } }));
    const save = () => {
        const e = {}; if (!p.name.trim()) e.name = 'Name is required'; if (!/^\S+@\S+\.\S+$/.test(p.email)) e.email = 'Enter a valid email'; setErr(e); if (Object.keys(e).length) return;
        setData(d => ({ ...d, settings: { ...d.settings, name: p.name.trim(), email: p.email }, groups: d.groups.map(g => ({ ...g, members: g.members.map(m => m.id === 'me' ? { ...m, name: p.name.trim() } : m) })) })); toast('Profile saved')
    };
    const exp = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'splitmate-backup.json'; a.click() };
    const imp = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const j = JSON.parse(r.result); if (!Array.isArray(j.groups) || !Array.isArray(j.expenses) || !Array.isArray(j.settlements) || !j.settings) throw 0; ask('Replace current data with this backup?', () => { setData(j); toast('Backup imported') }) } catch { toast('Invalid backup file') } }; r.readAsText(f); e.target.value = '' };
    return (<div className="grid2"><div className="card"><h3>User profile</h3><Field label="Name" error={err.name}><input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} /></Field>
        <Field label="Email" error={err.email}><input value={p.email} onChange={e => setP({ ...p, email: e.target.value })} /></Field><button className="btn" onClick={save}>Save profile</button></div>
        <div className="card"><h3>Preferences</h3><Field label="Currency"><select value={s.currency} onChange={e => upd({ currency: e.target.value })}>{CUR.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Theme"><select value={s.theme} onChange={e => upd({ theme: e.target.value })}><option value="light">Light</option><option value="dark">Dark</option></select></Field></div>
        <div className="card"><h3>Data</h3><p className="mut">Everything is stored in your browser's LocalStorage.</p><div className="row wrap">
            <button className="btn ghost" onClick={exp}>⬇ Export backup</button><label className="btn ghost">⬆ Import backup<input type="file" accept="application/json" hidden onChange={imp} /></label><button className="btn ghost" onClick={() => ask('Replace all data with demo data?', () => { setData(demo()); toast('Demo data restored') })}>Load demo data</button>
            <button className="btn danger" onClick={() => ask('Clear all groups, expenses and settlements? This cannot be undone.', () => { setData(d => ({ settings: d.settings, groups: [], expenses: [], settlements: [] })); toast('Data cleared') })}>Clear application data</button></div></div></div>)
}
