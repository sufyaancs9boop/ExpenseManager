import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [expenses, setExpenses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: ""
  });
  const [reminderText, setReminderText] = useState("");

  // Add expense
  const addExpense = (e) => {
    e.preventDefault();
    setExpenses([
      ...expenses,
      { ...form, amount: Number(form.amount), id: Date.now() }
    ]);
    setForm({ title: "", amount: "", type: "expense", category: "" });
  };

  // Add reminder
  const addReminder = () => {
    if (!reminderText) return;
    setReminders([
      ...reminders,
      { id: Date.now(), text: reminderText, done: false }
    ]);
    setReminderText("");
  };

  const toggleReminder = (id) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, done: !r.done } : r
      )
    );
  };

  // Calculations
  const income = expenses
    .filter((e) => e.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expenseTotal = expenses
    .filter((e) => e.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expenseTotal;

  // Pie chart data
  const chartData = {
    labels: ["Expenses", "Remaining Income"],
    datasets: [
      {
        data: [expenseTotal, Math.max(income - expenseTotal, 0)],
        backgroundColor: ["#ff6b6b", "#4ecdc4"]
      }
    ]
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Expense Manager</h1>
        <p className="subtitle">Track your income, expenses, and monthly reminders</p>
      </header>

      <div className="container">
        {/* Main Content Area */}
        <div className="main-content">
          {/* Summary Cards */}
          <div className="summary">
            <div className="summary-card income-card">
              <span className="summary-label">Income</span>
              <span className="summary-value">Rs {income.toLocaleString()}</span>
            </div>
            <div className="summary-card expense-card">
              <span className="summary-label">Expenses</span>
              <span className="summary-value">Rs {expenseTotal.toLocaleString()}</span>
            </div>
            <div className="summary-card balance-card">
              <span className="summary-label">Balance</span>
              <span className="summary-value">Rs {balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Add Transaction Form */}
          <div className="card">
            <h2 className="card-title">Add Transaction</h2>
            <form onSubmit={addExpense} className="transaction-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    placeholder="Transaction title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    className="input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    placeholder="Category (optional)"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Add Transaction</button>
            </form>
          </div>

          {/* Reminders Section */}
          <div className="card">
            <h2 className="card-title">Monthly Reminders</h2>
            <div className="reminder-section">
              <div className="reminder-input-container">
                <input
                  placeholder="Add a reminder (e.g., Electricity Bill due on 15th)"
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addReminder()}
                  className="input reminder-input"
                />
                <button onClick={addReminder} className="btn btn-secondary">
                  Add Reminder
                </button>
              </div>

              {reminders.length > 0 ? (
                <ul className="reminders">
                  {reminders.map((r) => (
                    <li
                      key={r.id}
                      onClick={() => toggleReminder(r.id)}
                      className={`reminder-item ${r.done ? "done" : ""}`}
                    >
                      <span className="reminder-checkbox">{r.done ? "✓" : ""}</span>
                      <span className="reminder-text">{r.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No reminders yet. Add one to get started!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar with Chart */}
        <aside className="sidebar">
          <div className="card chart-card">
            <h3 className="card-title">Breakdown</h3>
            {income > 0 ? (
              <div className="chart-container">
                <Pie data={chartData} options={{ maintainAspectRatio: true }} />
              </div>
            ) : (
              <div className="empty-chart">
                <p>Add income to see breakdown</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
