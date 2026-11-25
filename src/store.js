import { useState, useEffect, createContext, useContext } from 'react';
export const Ctx = createContext();
export const useApp = () => useContext(Ctx);
export const uid = () => Math.random().toString(36).slice(2, 9);
export const CATS = ['Food', 'Travel', 'Rent', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other'];
export const CUR = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];
export const today = () => new Date().toISOString().slice(0, 10);
const ago = n => {
    const x = new Date();
    x.setDate(x.getDate() - n);
    return x.toISOString().slice(0, 10)
};
export const sum = a => a.reduce((s, x) => s + x, 0);
export function useLS(k, init) {
    const [v, s] = useState(() => { try { const x = localStorage.getItem(k); if (x) return JSON.parse(x) } catch {} return typeof init === 'function' ? init() : init });
    useEffect(() => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }, [k, v]);
    return [v, s]
}
export function calcShares(type, amount, ids, raw = {}) {
    const a = +amount || 0,
        n = ids.length,
        o = {};
    if (!n) return o;
    if (type === 'equal') ids.forEach(i => o[i] = a / n);
    else if (type === 'unequal') {
        const t = sum(ids.map(i => +raw[i] || 0)) || 1;
        ids.forEach(i => o[i] = a * (+raw[i] || 0) / t)
    } else if (type === 'percent') ids.forEach(i => o[i] = a * (+raw[i] || 0) / 100);
    else ids.forEach(i => o[i] = +raw[i] || 0);
    return o
}
export function balances(g, ex, st) {
    const b = {};
    g.members.forEach(m => b[m.id] = 0);
    ex.filter(e => e.groupId === g.id).forEach(e => { b[e.paidBy] = (b[e.paidBy] || 0) + e.amount; for (const k in e.shares) b[k] = (b[k] || 0) - e.shares[k] });
    st.filter(s => s.groupId === g.id && s.status === 'completed').forEach(s => {
        b[s.from] = (b[s.from] || 0) + s.amount;
        b[s.to] = (b[s.to] || 0) - s.amount
    });
    return b
}
export function simplify(b) {
    const c = [],
        d = [];
    for (const k in b) {
        if (b[k] > .005) c.push([k, b[k]]);
        else if (b[k] < -.005) d.push([k, -b[k]])
    }
    c.sort((x, y) => y[1] - x[1]);
    d.sort((x, y) => y[1] - x[1]);
    const r = [];
    let i = 0,
        j = 0;
    while (i < c.length && j < d.length) {
        const m = Math.min(c[i][1], d[j][1]);
        r.push({ from: d[j][0], to: c[i][0], amount: m });
        c[i][1] -= m;
        d[j][1] -= m;
        if (c[i][1] < .005) i++;
        if (d[j][1] < .005) j++
    }
    return r
}
export const nameOf = (data, id) => { for (const g of data.groups) { const m = g.members.find(x => x.id === id); if (m) return m.name } return 'Unknown' };
const mk = (groupId, desc, amount, category, a, paidBy, splitType, parts, raw) => ({ id: uid(), groupId, desc, amount, category, date: ago(a), paidBy, splitType, parts, raw: raw || {}, shares: calcShares(splitType, amount, parts, raw) });
export const demo = () => {
    const A = ['me', 'a1', 'a2', 'a3'],
        B = ['me', 'b1', 'b2'];
    return {
        settings: { currency: 'USD', theme: 'light', name: 'You', email: 'you@example.com' },
        groups: [{ id: 'g1', name: 'Goa Trip', emoji: '🏖️', members: [{ id: 'me', name: 'You' }, { id: 'a1', name: 'Aisha' }, { id: 'a2', name: 'Rahul' }, { id: 'a3', name: 'Maya' }] },
            { id: 'g2', name: 'Roommates', emoji: '🏠', members: [{ id: 'me', name: 'You' }, { id: 'b1', name: 'Sam' }, { id: 'b2', name: 'Leo' }] }
        ],
        expenses: [mk('g1', 'Beach Resort', 800, 'Travel', 40, 'me', 'equal', A), mk('g1', 'Seafood Dinner', 240, 'Food', 38, 'a1', 'equal', A),
            mk('g1', 'Scooter Rental', 120, 'Travel', 37, 'a2', 'unequal', ['me', 'a1', 'a2'], { me: 1, a1: 1, a2: 2 }),
            mk('g1', 'Souvenirs', 90, 'Shopping', 36, 'a3', 'percent', A, { me: 40, a1: 20, a2: 20, a3: 20 }),
            mk('g1', 'Water Sports', 200, 'Entertainment', 36, 'me', 'custom', ['me', 'a1', 'a2'], { me: 80, a1: 60, a2: 60 }),
            mk('g2', 'November Rent', 1500, 'Rent', 25, 'me', 'equal', B), mk('g2', 'Electricity Bill', 90, 'Utilities', 15, 'b1', 'equal', B),
            mk('g2', 'Groceries', 135, 'Food', 8, 'b2', 'equal', B), mk('g2', 'Streaming Plan', 15, 'Entertainment', 5, 'me', 'equal', B), mk('g2', 'Pizza Night', 60, 'Food', 1, 'me', 'equal', B)
        ],
        settlements: [{ id: uid(), groupId: 'g2', from: 'b1', to: 'me', amount: 100, date: ago(3), status: 'completed' }]
    }
};