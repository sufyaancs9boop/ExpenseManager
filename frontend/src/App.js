import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import api from "./api";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // "login" or "signup"
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: ""
  });
  const [reminderText, setReminderText] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Fetch expenses after auth check
        await fetchExpenses();
      }
    } catch (error) {
      console.log("Not authenticated");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignup = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      setExpenses([]);
      setReminders([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!user) {
    if (authView === "login") {
      return (
        <Login 
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthView("signup")}
        />
      );
    } else {
      return (
        <Signup 
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthView("login")}
        />
      );
    }
  }

  // Add expense
  const addExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/expenses", {
        title: form.title,
        amount: Number(form.amount),
        type: form.type,
        category: form.category
      });
      setExpenses([...expenses, response.data]);
      setForm({ title: "", amount: "", type: "expense", category: "" });
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense");
    }
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
        backgroundColor: ["#ff8a4c", "#5ce1e6"]
      }
    ]
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Expensify</h1>
            <p className="subtitle">Track your income, expenses, and monthly reminders</p>
          </div>
          <div className="user-section">
            <span className="user-email">{user.email}</span>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>
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
