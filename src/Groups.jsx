import { useState } from 'react';
import { useApp, uid, balances, simplify, sum } from './store.js';
import { Modal, Field, Empty } from './ui.jsx';
import { Tx } from './Expenses.jsx';
function GroupForm({ init, onClose }) {
  const { data, setData, toast } = useApp();
  const [f, setF] = useState(init || { name: '', emoji: '👥', desc: '', members: [{ id: 'me', name: data.settings.name, email: data.settings.email }] }); const [err, setErr] = useState('');
  const used = id => data.expenses.some(e => e.groupId === f.id && (e.paidBy === id || e.parts.includes(id))) || data.settlements.some(s => s.groupId === f.id && (s.from === id || s.to === id));
  const setM = (i, n, k = 'name') => setF(p => ({ ...p, members: p.members.map((m, j) => j === i ? { ...m, [k]: n } : m) }));
  const del = i => { const m = f.members[i]; if (f.id && used(m.id)) return setErr(`${m.name} has expenses/settlements and can't be removed`); setErr(''); setF(p => ({ ...p, members: p.members.filter((_, j) => j !== i) })) };
  const save = () => {
    const n = f.members.map(m => m.name.trim().toLowerCase());
    if (!f.name.trim()) return setErr('Group name is required'); if (f.members.some(m => !m.name.trim())) return setErr('Member names cannot be empty'); if (f.members.some(m => m.email && !/^\S+@\S+\.\S+$/.test(m.email))) return setErr('Enter valid member emails');
    if (new Set(n).size !== n.length) return setErr('Member names must be unique'); if (f.members.length < 2) return setErr('Add at least 2 members');
    const g = { ...f, id: f.id || uid(), name: f.name.trim(), members: f.members.map(m => ({ ...m, name: m.name.trim() })) };
    setData(d => ({ ...d, groups: f.id ? d.groups.map(x => x.id === f.id ? g : x) : [...d.groups, g] })); toast('Group saved'); onClose()
  };
  return (<Modal title={f.id ? 'Edit group' : 'Create group'} onClose={onClose}>
    <div className="row"><Field label="Icon"><select value={f.emoji} onChange={e => setF({ ...f, emoji: e.target.value })}>{['👥', '🏖️', '🏠', '✈️', '🍕', '🎉', '👨‍👩‍👧', '💼'].map(x => <option key={x}>{x}</option>)}</select></Field>
      <Field label="Group name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field></div>
    <Field label="Description"><input value={f.desc || ''} placeholder="What is this group for?" onChange={e => setF({ ...f, desc: e.target.value })} /></Field><Field label="Members">{f.members.map((m, i) => (<div key={m.id} className="row"><input value={m.name} disabled={m.id === 'me'} onChange={e => setM(i, e.target.value)} /><input placeholder="Email (optional)" value={m.email || ''} onChange={e => setM(i, e.target.value, 'email')} />{m.id !== 'me' && <button className="btn sm danger" onClick={() => del(i)}>Remove</button>}</div>))}</Field>
    <button className="btn ghost sm" onClick={() => setF(p => ({ ...p, members: [...p.members, { id: uid(), name: '' }] }))}>+ Add member</button>
    {err && <p className="err">{err}</p>}<div className="row end"><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" onClick={save}>Save group</button></div></Modal>)
}
export default function Groups() {
  const { data, setData, fmt, ask, toast } = useApp(); const [form, setForm] = useState(null); const [sel, setSel] = useState(null);
  const g = data.groups.find(x => x.id === sel);
  if (g) {
    const b = balances(g, data.expenses, data.settlements), ex = data.expenses.filter(e => e.groupId === g.id);
    return (<><div className="row"><button className="btn ghost" onClick={() => setSel(null)}>← Back</button><button className="btn ghost" onClick={() => setForm(g)}>Edit</button>
      <button className="btn danger" onClick={() => ask(`Delete "${g.name}" and all its expenses?`, () => { setData(d => ({ ...d, groups: d.groups.filter(x => x.id !== g.id), expenses: d.expenses.filter(e => e.groupId !== g.id), settlements: d.settlements.filter(s => s.groupId !== g.id) })); setSel(null); toast('Group deleted') })}>Delete</button></div>
      <div className="card"><h3>{g.emoji} {g.name}</h3><p className="mut">{g.members.length} members · Total {fmt(sum(ex.map(e => e.amount)))}</p>{g.desc && <p>{g.desc}</p>}
        <div className="grid3">{g.members.map(m => (<div key={m.id} className="card mem"><div className="av">{m.name[0]}</div><b>{m.name}</b><small>{m.email}</small><small className={b[m.id] >= 0 ? 'pos' : 'neg'}>{b[m.id] >= .005 ? 'gets back ' + fmt(b[m.id]) : b[m.id] <= -.005 ? 'owes ' + fmt(-b[m.id]) : 'settled up'}</small>
          <small>Paid {fmt(sum(ex.filter(e => e.paidBy === m.id).map(e => e.amount)))}</small></div>))}</div></div>
      <div className="card"><h3>Group expenses</h3>{ex.length ? ex.map(e => <Tx key={e.id} e={e} />) : <Empty text="No expenses in this group" />}</div>
      {form && <GroupForm init={form} onClose={() => setForm(null)} />}</>)
  }
  return (<><div className="row end"><button className="btn" onClick={() => setForm('new')}>+ Create group</button></div>
    {data.groups.length ? <div className="grid3">{data.groups.map(x => (<div key={x.id} className="card gcard" onClick={() => setSel(x.id)}><div className="big">{x.emoji}</div><h3>{x.name}</h3>
      <small>{x.members.map(m => m.name).join(', ')}</small><b>{fmt(sum(data.expenses.filter(e => e.groupId === x.id).map(e => e.amount)))}</b></div>))}</div> : <Empty text="No groups yet. Create one!" />}
    {form && <GroupForm init={form === 'new' ? null : form} onClose={() => setForm(null)} />}</>)
}
