import { useState } from 'react';
import { useApp, CATS, sum, nameOf } from './store.js';
import { Bars, HBars, Donut, Empty } from './ui.jsx';
import { Tx } from './Expenses.jsx';
export default function Reports() {
    const { data, fmt } = useApp(); const [tab, setTab] = useState('month'); const [gr, setGr] = useState('');
    const ex = data.expenses.filter(e => !gr || e.groupId === gr);
    const months = [...new Set(ex.map(e => e.date.slice(0, 7)))].sort();
    const mItems = months.map(k => ({ label: new Date(k + '-02').toLocaleString(undefined, { month: 'short', year: '2-digit' }), value: sum(ex.filter(e => e.date.startsWith(k)).map(e => e.amount)) }));
    const cItems = CATS.map(c => ({ label: c, value: sum(ex.filter(e => e.category === c).map(e => e.amount)) })).filter(i => i.value > 0).sort((a, b) => b.value - a.value);
    const ids = [...new Set(ex.flatMap(e => [e.paidBy, ...e.parts]))];
    const share = ids.map(i => ({ label: nameOf(data, i), value: sum(ex.map(e => e.shares[i] || 0)) })).sort((a, b) => b.value - a.value);
    const paid = ids.map(i => ({ label: nameOf(data, i), value: sum(ex.filter(e => e.paidBy === i).map(e => e.amount)) })).sort((a, b) => b.value - a.value);
    const T = [['month', 'Monthly'], ['cat', 'Category'], ['ind', 'Individual'], ['hist', 'History']];
    return (<><div className="row wrap">{T.map(([k, l]) => <button key={k} className={'btn ' + (tab === k ? '' : 'ghost')} onClick={() => setTab(k)}>{l}</button>)}
        <select value={gr} onChange={e => setGr(e.target.value)}><option value="">All groups</option>{data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
        {!ex.length ? <Empty text="No data to report" /> : <>
            {tab === 'month' && <div className="card"><h3>Monthly expense report</h3><Bars items={mItems} fmt={fmt} /><p className="mut">Total {fmt(sum(ex.map(e => e.amount)))} across {ex.length} expenses</p></div>}
            {tab === 'cat' && <div className="card"><h3>Category-wise report</h3><Donut items={cItems} fmt={fmt} /><HBars items={cItems} fmt={fmt} /></div>}
            {tab === 'ind' && <div className="grid2"><div className="card"><h3>Individual spending (share of costs)</h3><HBars items={share} fmt={fmt} /></div><div className="card"><h3>Amount paid upfront</h3><HBars items={paid} fmt={fmt} /></div></div>}
            {tab === 'hist' && <div className="card"><h3>Expense history</h3>{[...ex].sort((a, b) => b.date.localeCompare(a.date)).map(e => <Tx key={e.id} e={e} />)}</div>}</>}</>)
}
