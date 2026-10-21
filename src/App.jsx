import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("pennywise-transactions");
      return saved ? JSON.parse(saved) : [
        { id: 1, title: "Monthly Salary", category: "Salary", amount: 25000, type: "income", date: "2026-10-01" },
        { id: 2, title: "Groceries", category: "Food", amount: 2500, type: "expense", date: "2026-10-05" },
        { id: 3, title: "Internet Bill", category: "Bills", amount: 799, type: "expense", date: "2026-10-08" }
      ];
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [type, setType] = useState("expense");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [filterType, setFilterType] = useState("all");
  useEffect(() => {
    localStorage.setItem("pennywise-transactions", JSON.stringify(transactions));
  }, [transactions]);

  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expenses;

  function addTransaction(e) {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;
    setTransactions([...transactions, {
      id: Date.now(), title: title.trim(), amount: Number(amount),
      category, type, date: new Date().toISOString().slice(0, 10)
    }]);
    setTitle("");
    setAmount("");
  }

  function deleteTransaction(id) {
    setTransactions(transactions.filter(t => t.id !== id));
  }

  function exportCSV() {
    const rows = [["Title", "Category", "Amount", "Type", "Date"],
      ...transactions.map(t => [t.title, t.category, t.amount, t.type, t.date])];
    const csv = rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pennywise-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>💰 Pennywise</h2>
        <button
  className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
  onClick={() => {
  setActiveSection("dashboard");
  document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
}}
>
  ▦ Dashboard
</button>

<button
  className={`nav-item ${activeSection === "transactions" ? "active" : ""}`}
  onClick={() => {
    setActiveSection("transactions");
    document.getElementById("transactions")?.scrollIntoView({ behavior: "smooth" });
  }}
>
  ☷ Transactions
</button>

<button
  className={`nav-item ${activeSection === "budgets" ? "active" : ""}`}
  onClick={() => {
    setActiveSection("budgets");
    document.getElementById("budgets")?.scrollIntoView({ behavior: "smooth" });
  }}
>
  ◷ Budgets
</button>
        <div className="account"><strong>My Finance</strong><br /><small>Personal account</small></div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="page-header">
          <div><h1>My Dashboard 👋</h1><p>Take control of your money, one step at a time.</p></div>
          <button type="button" onClick={exportCSV}>Export CSV ↓</button>
        </header>

        <section className="stats-grid">
          <article className="stat-card"><p>Total Balance</p><h2>₹{balance.toLocaleString("en-IN")}</h2><small>Income minus expenses</small></article>
          <article className="stat-card"><p>Total Income</p><h2>₹{income.toLocaleString("en-IN")}</h2><small>Money received</small></article>
          <article className="stat-card"><p>Total Expenses</p><h2>₹{expenses.toLocaleString("en-IN")}</h2><small>Money spent</small></article>
        </section>

        <section className="panel" id="transactions">
          <h2>＋ Add Transaction</h2>
          <form onSubmit={addTransaction} className="transaction-form">
            <label>Transaction Name<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Groceries" required /></label>
            <label>Amount (₹)<input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" required /></label>
            <label>Category<select value={category} onChange={e => setCategory(e.target.value)}><option>Food</option><option>Salary</option><option>Transport</option><option>Bills</option><option>Shopping</option><option>Education</option><option>Health</option><option>Other</option></select></label>
            <div className="type-options"><button type="button" className={type === "income" ? "type-btn selected-income" : "type-btn"} onClick={() => setType("income")}>Income</button><button type="button" className={type === "expense" ? "type-btn selected-expense" : "type-btn"} onClick={() => setType("expense")}>Expense</button></div>
            <button className="add-button" type="submit">+ Add Transaction</button>
          </form>
        </section>

        <section className="panel" id="transactions">
          <div className="section-heading"><h2>Recent Transactions</h2><span>{transactions.length} total</span></div>

          
<div className="filter-buttons">
  <button
    className={filterType === "all" ? "filter-btn selected" : "filter-btn"}
    onClick={() => setFilterType("all")}
  >
    All
  </button>

  <button
    className={filterType === "income" ? "filter-btn selected" : "filter-btn"}
    onClick={() => setFilterType("income")}
  >
    Income
  </button>

  <button
    className={filterType === "expense" ? "filter-btn selected" : "filter-btn"}
    onClick={() => setFilterType("expense")}
  >
    Expense
  </button>
</div>

          {transactions.length === 0 ? <p className="empty-state">No transactions yet. Add your first transaction above!</p> :
            <div className="transactions-list">{[...transactions]
  .filter(t => filterType === "all" || t.type === filterType)
  .reverse()
  .map(t =>
              <div className="transaction-row" key={t.id}>
                <div className="transaction-icon">{t.type === "income" ? "↙" : "↗"}</div>
                <div className="transaction-details"><strong>{t.title}</strong><small>{t.category} · {t.date}</small></div>
                <strong className={t.type === "income" ? "income-amount" : "expense-amount"}>{t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}</strong>
                <button className="delete-button" type="button" onClick={() => deleteTransaction(t.id)}>Delete</button>
              </div>
            )}</div>}
        </section>

        
        <section className="panel" id="budgets">
          <h2>Monthly Budget Overview</h2>
          <p>Track your spending by reviewing your expense total.</p>
          <div className="budget-summary"><span>Total expenses</span><strong>₹{expenses.toLocaleString("en-IN")}</strong></div>
          <div className="budget-track"><div className="budget-progress" style={{ width: Math.min((expenses / 10000) * 100, 100) + "%" }} /></div>
          <small>Illustrative monthly spending target: ₹10,000</small>
        </section>
      </main>
    </div>
  );
}

export default App;