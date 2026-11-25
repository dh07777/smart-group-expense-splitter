# SplitMate – Smart Group Expense Splitter
React + Hooks + LocalStorage. No backend.
## Run
1. Install Node.js LTS (nodejs.org) and VS Code
2. VS Code > File > Open Folder > splitmate
3. Terminal > New Terminal, then: `npm install` then `npm run dev`
4. Open http://localhost:5173
Build: `npm run build`
## Structure
index.html, package.json, vite.config.js
src/ main.jsx, App.jsx, store.js (state, demo data, split/settle logic), ui.jsx (shared components),
Dashboard.jsx, Groups.jsx, Expenses.jsx, Settle.jsx, Reports.jsx, Settings.jsx, styles.css
## Extras
URL-hash routing (browser back works), donut charts, CSV export, JSON backup/import, sorting, member emails, group descriptions.
