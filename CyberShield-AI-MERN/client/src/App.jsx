import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Link2,
  Mail,
  MessageSquare,
  Activity,
  History,
  Bot,
  AlertTriangle,
  Search,
  ShieldAlert,
  Users,
  LogOut,
  User,
  Trash2,
  RefreshCw,
  FolderOpen,
  FolderPlus,
  Bookmark
} from "lucide-react";
import WelcomeAuth from "./components/WelcomeAuth.jsx";
import AdminUsers from "./components/AdminUsers.jsx";
import CollectionsView from "./components/CollectionsView.jsx";
import SaveToCollectionModal from "./components/SaveToCollectionModal.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("cybershield_token") || "");
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("cybershield_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("scanner");
  const [type, setType] = useState("url");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, phishing: 0, suspicious: 0, safe: 0, averageRisk: 0 });
  const [loading, setLoading] = useState(false);
  const [historyScope, setHistoryScope] = useState("mine"); // "mine" default for strict separation
  const [savingScan, setSavingScan] = useState(null);

  // Handle successful login
  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("cybershield_token", userToken);
    localStorage.setItem("cybershield_user", JSON.stringify(userData));
    setHistoryScope("mine");
    setHistory([]);
    setStats({ total: 0, phishing: 0, suspicious: 0, safe: 0, averageRisk: 0 });
    setResult(null);
    setSavingScan(null);
    setPage("scanner");
    load(userToken, "mine");
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("cybershield_token");
    localStorage.removeItem("cybershield_user");
    setHistory([]);
    setStats({ total: 0, phishing: 0, suspicious: 0, safe: 0, averageRisk: 0 });
    setResult(null);
    setSavingScan(null);
  };

  // Verify session on mount
  useEffect(() => {
    if (token) {
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => {
          if (!r.ok) {
            handleLogout();
          } else {
            return r.json();
          }
        })
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem("cybershield_user", JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const load = async (activeToken = token, activeScope = historyScope) => {
    if (!activeToken) return;
    try {
      const headers = { Authorization: `Bearer ${activeToken}` };
      const scopeParam = user?.role === "admin" && activeScope === "all" ? "?scope=all" : "";
      const [h, s] = await Promise.all([
        fetch(`${API}/scans${scopeParam}`, { headers }).then((r) => r.json()),
        fetch(`${API}/scans/stats${scopeParam}`, { headers }).then((r) => r.json())
      ]);
      setHistory(Array.isArray(h) ? h : []);
      if (s && !s.message) setStats(s);
    } catch (err) {
      console.error("Failed to load user scans or stats:", err);
    }
  };

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token, historyScope]);

  const scan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
      const r = await fetch(`${API}/scans`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type, input })
      });
      const data = await r.json();
      setResult(data);
      load();
    } catch {
      alert("Backend is not running. Please start the server.");
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id) => {
    if (!confirm("Are you sure you want to delete this scan record?")) return;
    try {
      const res = await fetch(`${API}/scans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        load();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete record.");
      }
    } catch {
      alert("Error deleting scan.");
    }
  };

  const demo = () => {
    setType("url");
    setInput("http://free-prize-login.xyz/verify?account=urgent");
  };

  // If user is not authenticated, show Welcome to CyberShield AI landing page with login
  if (!token || !user) {
    return <WelcomeAuth API={API} onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.role === "admin";

  const nav = [
    ["scanner", "AI Scanner", Search],
    ["collections", "My Collections", FolderOpen],
    ["history", "Scan History", History],
    ["analytics", "Analytics", Activity],
    ["assistant", "Safety Assistant", Bot],
    ...(isAdmin ? [["users", "User Management", Users]] : [])
  ];

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">
            <ShieldCheck />
          </div>
          <div>
            <b>CyberShield AI</b>
            <span className="roleTag">{isAdmin ? "Admin Workspace" : "User Workspace"}</span>
          </div>
        </div>

        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              className={page === id ? "active" : ""}
              onClick={() => setPage(id)}
              key={id}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* User Profile Card in Sidebar */}
        <div className="userSidebarCard">
          <div className="userInfoRow">
            <div className={`avatarMini ${user.role}`}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="userDetails">
              <div className="nameWrapper">
                <strong>{user.name || "Logged In"}</strong>
                <span className={`badge ${user.role}`}>
                  {user.role === "admin" ? "ADMIN" : "USER"}
                </span>
              </div>
              <small className="userEmailText" title={user.email}>
                {user.email}
              </small>
            </div>
          </div>
          <button className="logoutBtn" onClick={handleLogout} title="Log out">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <span className="eyebrow">
              {isAdmin ? "CYBERSHIELD AI • ADMINISTRATOR" : "CYBERSHIELD AI • USER"}
            </span>
            <h1>
              {page === "scanner"
                ? "Threat Scanner"
                : page === "collections"
                ? "My Threat Collections"
                : page === "analytics"
                ? "Security Analytics"
                : page === "history"
                ? "Scan History"
                : page === "users"
                ? "User Management"
                : "Cyber Safety Assistant"}
            </h1>
          </div>
          <div className="headerRight">
            <div className="status">
              <i /> System Online
            </div>
            <div className="headerUserBadge">
              <span className={`pill ${user.role}`}>
                {user.role === "admin" ? "🛡️ System Admin" : "👤 Standard User"}
              </span>
            </div>
          </div>
        </header>

        {page === "scanner" && (
          <section>
            <div className="hero">
              <div>
                <span className="pill">● AI-POWERED DETECTION</span>
                <h2>Check before you click.</h2>
                <p>
                  Analyze suspicious URLs, emails, and messages and understand exactly why they may be dangerous.
                  Scans are automatically saved to your private history.
                </p>
              </div>
              <div className="heroShield">
                <ShieldCheck size={86} />
              </div>
            </div>

            <div className="stats">
              <Card title="My Total Scans" value={stats.total} icon={<Search />} />
              <Card title="Phishing Blocked" value={stats.phishing} icon={<AlertTriangle />} />
              <Card title="Suspicious" value={stats.suspicious} icon={<ShieldAlert />} />
              <Card title="My Avg Risk" value={`${stats.averageRisk}/100`} icon={<Activity />} />
            </div>

            <div className="grid">
              <div className="panel">
                <div className="panelTitle">
                  <b>AI Threat Scanner</b>
                  <span>Explainable analysis</span>
                </div>
                <div className="tabs">
                  {[
                    ["url", "URL", Link2],
                    ["email", "Email", Mail],
                    ["message", "Message", MessageSquare]
                  ].map(([v, l, I]) => (
                    <button
                      className={type === v ? "selected" : ""}
                      onClick={() => setType(v)}
                      key={v}
                    >
                      <I size={16} />
                      {l}
                    </button>
                  ))}
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    type === "url"
                      ? "Paste a suspicious URL here (e.g. http://login-bank-verify.xyz)..."
                      : "Paste an email or message text here..."
                  }
                />
                <div className="actions">
                  <button className="primary" onClick={scan} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze with AI"}
                  </button>
                  <button onClick={demo}>Try Demo</button>
                </div>
              </div>

              <div className="panel result">
                {!result ? (
                  <div className="empty">
                    <ShieldCheck size={42} />
                    <b>Ready to analyze</b>
                    <span>Your scan result and explanation will appear here.</span>
                  </div>
                ) : (
                  <>
                    <div className={`score ${result.classification?.toLowerCase()}`}>
                      <div className="scoreNum">{result.score}</div>
                      <div>
                        <b>{result.classification}</b>
                        <span>Risk Score / 100</span>
                      </div>
                    </div>
                    <div className="resultRow">
                      <b>Threat category</b>
                      <span>{result.threatCategory}</span>
                    </div>
                    <div className="resultRow">
                      <b>Confidence</b>
                      <span>{result.confidence}%</span>
                    </div>
                    <h3>Why this result?</h3>
                    <ul>
                      {result.indicators?.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                    <h3>Safety recommendations</h3>
                    <ul>
                      {result.recommendations?.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>

                    {/* Button to save scan into a collection */}
                    <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #16324a" }}>
                      <button
                        className="saveToColBtn"
                        onClick={() => setSavingScan(result)}
                      >
                        <FolderPlus size={16} /> Save to My Collection
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {page === "collections" && <CollectionsView API={API} token={token} />}

        {page === "analytics" && <Analytics stats={stats} history={history} />}

        {page === "history" && (
          <HistoryPage
            history={history}
            isAdmin={isAdmin}
            onDelete={deleteScan}
            scope={historyScope}
            setScope={setHistoryScope}
            onRefresh={load}
            onSaveToCollection={(scan) => setSavingScan(scan)}
          />
        )}

        {page === "assistant" && <Assistant />}

        {page === "users" && isAdmin && <AdminUsers API={API} token={token} />}

        {/* Modal for Saving Scan to Collection */}
        {savingScan && (
          <SaveToCollectionModal
            API={API}
            token={token}
            scan={savingScan}
            onClose={() => setSavingScan(null)}
            onSuccess={() => {
              // Can optionally reload or notify
            }}
          />
        )}
      </main>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="card">
      <div className="icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Analytics({ stats, history }) {
  return (
    <section>
      <div className="stats">
        <Card title="Total Scans" value={stats.total} icon={<Search />} />
        <Card title="Phishing" value={stats.phishing} icon={<AlertTriangle />} />
        <Card title="Safe" value={stats.safe} icon={<ShieldCheck />} />
        <Card title="Avg Risk" value={`${stats.averageRisk}/100`} icon={<Activity />} />
      </div>
      <div className="panel">
        <div className="panelTitle">
          <b>Threat Distribution</b>
          <span>Based on your scans</span>
        </div>
        {["Phishing", "Suspicious", "Safe"].map((x, i) => {
          const n = [stats.phishing, stats.suspicious, stats.safe][i];
          const pct = stats.total ? Math.round((n / stats.total) * 100) : 0;
          return (
            <div className="barRow" key={x}>
              <span>{x}</span>
              <div>
                <i style={{ width: `${pct}%` }} />
              </div>
              <b>{pct}%</b>
            </div>
          );
        })}
      </div>
      <div className="panel">
        <h3>Recent Scan Activity</h3>
        <HistoryList history={history.slice(0, 6)} />
      </div>
    </section>
  );
}

function HistoryList({ history, isAdmin, onDelete, onSaveToCollection }) {
  if (!history || history.length === 0) {
    return (
      <div className="empty">
        <History size={36} />
        <b>No scans found</b>
        <span>Run a scan from the AI Threat Scanner to see your results here.</span>
      </div>
    );
  }

  return (
    <div className="history">
      {history.map((x) => (
        <div className="historyItem" key={x._id}>
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <b className={`classificationTag ${x.classification?.toLowerCase()}`}>
                {x.classification}
              </b>
              {x.userEmail && (
                <span className="historyEmailBadge">
                  <User size={11} style={{ marginRight: "3px" }} />
                  {x.userEmail}
                </span>
              )}
            </div>
            <span>
              {x.type.toUpperCase()} • {new Date(x.createdAt).toLocaleString()}
            </span>
            <small title={x.input}>{x.input}</small>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <strong className={`scoreMini ${x.classification?.toLowerCase()}`}>
              {x.score}/100
            </strong>
            {onSaveToCollection && (
              <button
                className="iconBtn"
                onClick={() => onSaveToCollection(x)}
                title="Save to Collection"
              >
                <Bookmark size={15} />
              </button>
            )}
            {onDelete && (
              <button
                className="deleteBtn"
                onClick={() => onDelete(x._id)}
                title="Delete this scan record"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryPage({ history, isAdmin, onDelete, scope, setScope, onRefresh, onSaveToCollection }) {
  return (
    <section>
      <div className="panelTitle" style={{ marginBottom: "15px" }}>
        {isAdmin ? (
          <div className="historyScopeTabs">
            <button
              className={`scopeTab ${scope === "mine" ? "active" : ""}`}
              onClick={() => setScope("mine")}
            >
              My Personal Scans
            </button>
            <button
              className={`scopeTab ${scope === "all" ? "active" : ""}`}
              onClick={() => setScope("all")}
            >
              All System Scans (Auditing)
            </button>
          </div>
        ) : (
          <div>
            <b>My Personal Scan History</b>
            <span style={{ fontSize: "11px", color: "#7992a9" }}>
              Only you have access to your personal scan history.
            </span>
          </div>
        )}
        <button className="iconBtn" onClick={onRefresh} title="Refresh Scans">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="panel">
        <HistoryList
          history={history}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onSaveToCollection={onSaveToCollection}
        />
      </div>
    </section>
  );
}

function Assistant() {
  const [q, setQ] = useState("");
  const [a, setA] = useState(
    "Ask me how to identify phishing, protect your accounts, or respond to a suspicious message."
  );

  const answer = () => {
    const s = q.toLowerCase();
    setA(
      s.includes("otp")
        ? "Never share an OTP with anyone. Legitimate banks and services will never call or message asking for your one-time code."
        : s.includes("link")
        ? "Do not click unverified links. Look for lookalike domains (e.g., paypa1.com instead of paypal.com) and navigate directly to official websites."
        : s.includes("password")
        ? "Use strong, distinct passwords for each service, never reuse them, and activate Multi-Factor Authentication (MFA)."
        : s.includes("admin")
        ? "Only two designated system emails are authorized for administrator access. System administrators can oversee all scans and user accounts."
        : s.includes("collection")
        ? "Threat Collections allow you to categorize and preserve analyzed threats, malicious URLs, and safe sites privately in your account."
        : "Treat urgent requests for money, credentials, gift cards, or security actions with high suspicion. Always verify through a verified independent channel."
    );
  };

  return (
    <div className="assistant panel">
      <div className="bot">
        <Bot size={38} />
      </div>
      <h2>Cyber Safety Assistant</h2>
      <p>{a}</p>
      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Example: How do I store and organize verified threats in collections?"
      />
      <button className="primary" onClick={answer}>
        Ask Assistant
      </button>
    </div>
  );
}

export default App;
