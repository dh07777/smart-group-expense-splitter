import { useState } from 'react';
import { useApp, uid, today, balances, simplify, nameOf } from './store.js';
import { Modal, Field, Empty } from './ui.jsx';
export default function Settle() {
    const { data, setData, fmt, ask, toast } = useApp(); const [gid, setGid] = useState(data.groups[0]?.id || ''); const [form, setForm] = useState(null); const [err, setErr] = useState('');
    const g = data.groups.find(x => x.id === gid) || data.groups[0]; if (!g) return <Empty text="Create a group to manage settlements" />;
    const b = balances(g, data.expenses, data.settlements), sug = simplify(b), nm = id => nameOf(data, id);
    const sts = data.settlements.filter(s => s.groupId === g.id).sort((a, c) => c.date.localeCompare(a.date));
    const add = (s, status) => { setData(d => ({ ...d, settlements: [{ id: uid(), groupId: g.id, from: s.from, to: s.to, amount: +(+s.amount).toFixed(2), date: today(), status }, ...d.settlements] })); toast(status === 'completed' ? 'Payment recorded' : 'Pending settlement added') };
    const saveForm = () => { if (form.from === form.to) return setErr('Payer and receiver must differ'); if (!(+form.amount > 0)) return setErr('Enter a valid amount'); add(form, 'completed'); setForm(null); setErr('') };
    return (<><div className="row"><select value={g.id} onChange={e => setGid(e.target.value)}>{data.groups.map(x => <option key={x.id} value={x.id}>{x.emoji} {x.name}</option>)}</select>
        <button className="btn" onClick={() => { setErr(''); setForm({ from: g.members[0].id, to: g.members[1]?.id || g.members[0].id, amount: '' }) }}>+ Record settlement</button></div>
        <div className="card"><h3>Balances</h3>{g.members.map(m => <div key={m.id} className="tx"><div className="av">{m.name[0]}</div><b className="grow">{m.name}</b><b className={b[m.id] >= 0 ? 'pos' : 'neg'}>{b[m.id] >= .005 ? 'is owed ' + fmt(b[m.id]) : b[m.id] <= -.005 ? 'owes ' + fmt(-b[m.id]) : 'settled'}</b></div>)}</div>
        <div className="card"><h3>Simplified settlement suggestions</h3>{sug.length ? sug.map((s, i) => (<div key={i} className="tx"><div className="grow"><b>{nm(s.from)}</b> pays <b>{nm(s.to)}</b></div><b>{fmt(s.amount)}</b>
            <button className="btn sm ghost" onClick={() => add(s, 'pending')}>Mark pending</button><button className="btn sm" onClick={() => add(s, 'completed')}>Mark paid</button></div>)) : <Empty text="🎉 Everyone is settled up" />}</div>
        <div className="card"><h3>Settlement history</h3>{sts.length ? sts.map(s => (<div key={s.id} className="tx"><div className="grow"><b>{nm(s.from)}</b> → <b>{nm(s.to)}</b><small>{s.date}</small></div><b>{fmt(s.amount)}</b><span className={'badge ' + s.status}>{s.status}</span>
            {s.status === 'pending' && <button className="btn sm" onClick={() => { setData(d => ({ ...d, settlements: d.settlements.map(x => x.id === s.id ? { ...x, status: 'completed', date: today() } : x) })); toast('Marked completed') }}>Complete</button>}
            <button className="btn sm danger" onClick={() => ask('Delete this settlement record?', () => setData(d => ({ ...d, settlements: d.settlements.filter(x => x.id !== s.id) })))}>✕</button></div>)) : <Empty text="No settlements recorded" />}</div>
        {form && <Modal title="Record settlement" onClose={() => setForm(null)}><div className="row"><Field label="From"><select value={form.from} onChange={e => setForm({ ...form, from: e.target.value })}>{g.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
            <Field label="To"><select value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}>{g.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field></div>
            <Field label="Amount"><input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></Field>{err && <p className="err">{err}</p>}
            <div className="row end"><button className="btn ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn" onClick={saveForm}>Save</button></div></Modal>}</>)
}
