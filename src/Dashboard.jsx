import { useApp, balances, sum, CATS } from './store.js';
import { Stat, Bars, Donut, Empty } from './ui.jsx';
import { Tx } from './Expenses.jsx';
export default function Dashboard() {
    const { data, fmt, go } = useApp(); const { groups, expenses, settlements } = data; let owe = 0, get = 0;
    const gb = groups.map(g => ({ g, v: balances(g, expenses, settlements).me || 0 })); gb.forEach(({ v }) => v > 0 ? get += v : owe -= v);
    const months = [...Array(6)].map((_, i) => { const x = new Date(); x.setDate(1); x.setMonth(x.getMonth() - 5 + i); return x.toISOString().slice(0, 7) });
    const items = months.map(k => ({ label: new Date(k + '-02').toLocaleString(undefined, { month: 'short' }), value: sum(expenses.filter(e => e.date.startsWith(k)).map(e => e.amount)) }));
    const cats = CATS.map(c => ({ label: c, value: sum(expenses.filter(e => e.category === c).map(e => e.amount)) })).filter(i => i.value > 0);
    const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    return (<><div className="grid4">
        <Stat icon="💼" label="Total group expenses" value={fmt(sum(expenses.map(e => e.amount)))} />
        <Stat icon="💳" label="Total you paid" value={fmt(sum(expenses.filter(e => e.paidBy === 'me').map(e => e.amount)))} tone="blue" />
        <Stat icon="📤" label="You owe" value={fmt(owe)} tone="red" />
        <Stat icon="📥" label="You are owed" value={fmt(get)} tone="green" /></div>
        <div className="grid2"><div className="card"><h3>Monthly expense summary</h3><Bars items={items} fmt={fmt} /></div>
            <div className="card"><h3>Spending by category</h3>{cats.length ? <Donut items={cats} fmt={fmt} /> : <Empty text="No data" />}</div></div>
        <div className="grid2"><div className="card"><h3>Your balance by group</h3>{gb.length ? gb.map(({ g, v }) => (<div key={g.id} className="tx"><div className="ic">{g.emoji}</div><b className="grow">{g.name}</b><b className={v >= 0 ? 'pos' : 'neg'}>{v >= .005 ? 'owed ' + fmt(v) : v <= -.005 ? 'owe ' + fmt(-v) : 'settled'}</b></div>)) : <Empty text="No groups" />}
            <button className="btn sm" onClick={() => go('settle')}>Settle up →</button></div>
            <div className="card"><h3>Recent transactions</h3>{recent.length ? recent.map(e => <Tx key={e.id} e={e} />) : <Empty text="No transactions yet" />}</div></div></>)
}
