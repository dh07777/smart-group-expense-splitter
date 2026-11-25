import { useState } from 'react';
import { useApp, CATS, calcShares, uid, today, nameOf } from './store.js';
import { Modal, Field, Empty } from './ui.jsx';
const ICON = { Food: '🍽️', Travel: '✈️', Rent: '🏠', Utilities: '💡', Shopping: '🛍️', Entertainment: '🎬', Health: '💊', Other: '📦' };
export const Tx = ({ e, onEdit, onDel }) => {
  const { data, fmt } = useApp(); const g = data.groups.find(x => x.id === e.groupId);
  return (<div className="tx"><div className="ic">{ICON[e.category]}</div><div className="grow"><b>{e.desc}</b><small>{g?.emoji} {g?.name} · {e.date} · {e.category} · paid by {nameOf(data, e.paidBy)} · {e.splitType}</small></div>
    <b>{fmt(e.amount)}</b>{onEdit && <div className="row"><button className="btn sm ghost" onClick={() => onEdit(e)}>Edit</button><button className="btn sm danger" onClick={() => onDel(e)}>Delete</button></div>}</div>)
};
export function ExpenseForm({ init, onClose }) {
  const { data, setData, toast, fmt } = useApp(); const { groups } = data;
  const [f, setF] = useState(init || { groupId: groups[0]?.id || '', desc: '', amount: '', category: 'Food', date: today(), paidBy: 'me', splitType: 'equal', parts: groups[0] ? groups[0].members.map(m => m.id) : [], raw: {} });
  const [err, setErr] = useState({}); const g = groups.find(x => x.id === f.groupId); const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const pick = id => setF(p => ({ ...p, groupId: id, paidBy: 'me', parts: groups.find(x => x.id === id).members.map(m => m.id), raw: {} }));
  const tog = id => set('parts', f.parts.includes(id) ? f.parts.filter(x => x !== id) : [...f.parts, id]);
  const sh = calcShares(f.splitType, f.amount, f.parts, f.raw);
  const save = () => {
    const e = {}, a = +f.amount, s = f.parts.reduce((t, i) => t + (+f.raw[i] || 0), 0);
    if (!f.desc.trim()) e.desc = 'Description is required'; if (!(a > 0)) e.amount = 'Enter an amount greater than 0'; if (!f.date) e.date = 'Date is required';
    if (!g) e.groupId = 'Create a group first'; if (!f.parts.length) e.parts = 'Select at least one participant';
    if (f.splitType === 'percent' && Math.abs(s - 100) > .01) e.split = `Percentages must total 100 (now ${s})`;
    if (f.splitType === 'custom' && Math.abs(s - a) > .01) e.split = `Amounts must total ${a} (now ${s.toFixed(2)})`;
    if (f.splitType === 'unequal' && s <= 0) e.split = 'Enter share weights (e.g. 1, 2, 3)';
    setErr(e); if (Object.keys(e).length) return;
    const ex = { ...f, desc: f.desc.trim(), id: f.id || uid(), amount: a, shares: calcShares(f.splitType, a, f.parts, f.raw) };
    setData(d => ({ ...d, expenses: f.id ? d.expenses.map(x => x.id === f.id ? ex : x) : [ex, ...d.expenses] })); toast('Expense saved'); onClose()
  };
  const unit = { unequal: 'shares', percent: '%', custom: 'amount' }[f.splitType];
  return (<Modal title={f.id ? 'Edit expense' : 'Add expense'} onClose={onClose}>
    <Field label="Group" error={err.groupId}><select value={f.groupId} onChange={e => pick(e.target.value)}>{groups.map(x => <option key={x.id} value={x.id}>{x.emoji} {x.name}</option>)}</select></Field>
    <Field label="Description" error={err.desc}><input value={f.desc} onChange={e => set('desc', e.target.value)} placeholder="Dinner, taxi..." /></Field>
    <div className="row"><Field label="Amount" error={err.amount}><input type="number" min="0" step="0.01" value={f.amount} onChange={e => set('amount', e.target.value)} /></Field>
      <Field label="Date" error={err.date}><input type="date" value={f.date} onChange={e => set('date', e.target.value)} /></Field></div>
    <div className="row"><Field label="Category"><select value={f.category} onChange={e => set('category', e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Paid by"><select value={f.paidBy} onChange={e => set('paidBy', e.target.value)}>{g?.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field></div>
    <Field label="Split type"><select value={f.splitType} onChange={e => setF(p => ({ ...p, splitType: e.target.value, raw: {} }))}>
      <option value="equal">Equal</option><option value="unequal">Unequal (by shares)</option><option value="percent">Percentage</option><option value="custom">Custom amounts</option></select></Field>
    <Field label="Participants" error={err.parts || err.split}>{g?.members.map(m => (<div key={m.id} className="part"><label><input type="checkbox" checked={f.parts.includes(m.id)} onChange={() => tog(m.id)} /> {m.name}</label>
      {f.parts.includes(m.id) && unit && <input className="mini" type="number" min="0" step="0.01" placeholder={unit} value={f.raw[m.id] ?? ''} onChange={e => set('raw', { ...f.raw, [m.id]: e.target.value })} />}
      {f.parts.includes(m.id) && <small>{fmt(sh[m.id])}</small>}</div>))}</Field>
    <div className="row end"><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" onClick={save}>Save expense</button></div></Modal>)
}
export default function Expenses() {
  const { data, setData, ask, toast } = useApp(); const [q, setQ] = useState(''); const [gr, setGr] = useState(''); const [cat, setCat] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [form, setForm] = useState(null); const [so, setSo] = useState('new');
  const list = data.expenses.filter(e => (!q || e.desc.toLowerCase().includes(q.toLowerCase())) && (!gr || e.groupId === gr) && (!cat || e.category === cat) && (!from || e.date >= from) && (!to || e.date <= to)).sort((a, b) => so === 'old' ? a.date.localeCompare(b.date) : so === 'hi' ? b.amount - a.amount : so === 'lo' ? a.amount - b.amount : b.date.localeCompare(a.date));
  const csv = () => { const r = [['Date', 'Group', 'Description', 'Category', 'Paid by', 'Amount', 'Split'], ...list.map(e => [e.date, data.groups.find(g => g.id === e.groupId)?.name, e.desc, e.category, nameOf(data, e.paidBy), e.amount, e.splitType])]; const t = r.map(x => x.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'splitmate-expenses.csv'; a.click() };
  const add = () => data.groups.length ? setForm('new') : toast('Create a group first');
  return (<><div className="card filters"><input placeholder="🔍 Search transactions" value={q} onChange={e => setQ(e.target.value)} />
    <select value={gr} onChange={e => setGr(e.target.value)}><option value="">All groups</option>{data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
    <select value={cat} onChange={e => setCat(e.target.value)}><option value="">All categories</option>{CATS.map(c => <option key={c}>{c}</option>)}</select>
    <input type="date" value={from} onChange={e => setFrom(e.target.value)} title="From" /><input type="date" value={to} onChange={e => setTo(e.target.value)} title="To" />
    <button className="btn ghost" onClick={() => { setQ(''); setGr(''); setCat(''); setFrom(''); setTo('') }}>Clear</button><select value={so} onChange={e => setSo(e.target.value)}><option value="new">Newest first</option><option value="old">Oldest first</option><option value="hi">Amount: high→low</option><option value="lo">Amount: low→high</option></select><button className="btn ghost" onClick={csv}>⬇ CSV</button><button className="btn" onClick={add}>+ Add expense</button></div>
    <div className="card">{list.length ? list.map(e => <Tx key={e.id} e={e} onEdit={x => setForm(x)} onDel={x => ask(`Delete "${x.desc}"?`, () => { setData(d => ({ ...d, expenses: d.expenses.filter(y => y.id !== x.id) })); toast('Expense deleted') })} />) : <Empty text="No expenses match your filters" />}</div>
    {form && <ExpenseForm init={form === 'new' ? null : form} onClose={() => setForm(null)} />}</>)
}
