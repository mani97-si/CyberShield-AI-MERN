import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  Activity,
  Bot,
  CheckCircle2
} from "lucide-react";

export default function WelcomeAuth({ API, onLoginSuccess }) {
  const [roleMode, setRoleMode] = useState("user"); // "user" | "admin"
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminEmails, setAdminEmails] = useState(["admin@cybershield.ai", "security@cybershield.ai"]);

  useEffect(() => {
    // Fetch designated admin emails from backend
    fetch(`${API}/auth/admin-emails`)
      .then((res) => res.json())
      .then((data) => {
        if (data.adminEmails && data.adminEmails.length > 0) {
          setAdminEmails(data.adminEmails);
        }
      })
      .catch(() => {});
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (authMode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // If attempting admin login or registration, check authorized emails
    if (roleMode === "admin" && !adminEmails.includes(cleanEmail)) {
      setError(
        `Only designated admin emails (${adminEmails.join(
          " or "
        )}) are authorized for Administrator access.`
      );
      return;
    }

    setLoading(true);

    try {
      const endpoint = authMode === "login" ? `${API}/auth/login` : `${API}/auth/register`;
      const payload = {
        email: cleanEmail,
        password,
        loginType: roleMode,
        requestedRole: roleMode,
        ...(authMode === "register" && { name: name.trim() })
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed. Please verify your details.");
      }

      // Successful auth
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || "Network error. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (fillRole, fillEmail, fillPass) => {
    setRoleMode(fillRole);
    setAuthMode("login");
    setEmail(fillEmail);
    setPassword(fillPass);
    setError("");
  };

  return (
    <div className="welcomeContainer">
      {/* Top Navbar */}
      <header className="welcomeNav">
        <div className="welcomeBrand">
          <div className="welcomeLogo">
            <ShieldCheck size={26} />
          </div>
          <div>
            <b>CyberShield AI</b>
            <span>Cyber Safety & Phishing Defense</span>
          </div>
        </div>
        <div className="welcomeNavRight">
          <span className="badge live">
            <i className="statusDot" /> System Online
          </span>
        </div>
      </header>

      {/* Main Welcome Hero Section */}
      <div className="welcomeMain">
        {/* Left Column: Welcome messaging & features */}
        <div className="welcomeLeft">
          <div className="welcomeBadge">
            <Sparkles size={14} /> AI-POWERED CYBER PROTECTION
          </div>
          <h1 className="welcomeTitle">
            Welcome to <span>CyberShield AI</span>
          </h1>
          <p className="welcomeSubtitle">
            Your real-time shield against phishing scams, deceptive links, and social engineering attacks.
            Verify before you trust.
          </p>

          <div className="welcomeFeatureList">
            <div className="welcomeFeatureItem">
              <div className="featureIcon">
                <Search size={20} />
              </div>
              <div>
                <strong>AI Threat Scanner</strong>
                <p>Analyze URLs, emails, and SMS for spoofing, deceptive redirects, and urgent hooks.</p>
              </div>
            </div>

            <div className="welcomeFeatureItem">
              <div className="featureIcon">
                <Activity size={20} />
              </div>
              <div>
                <strong>Explainable Risk Engine</strong>
                <p>Transparent 0-100 risk scoring with breakdown of exact red flags and safe recommendations.</p>
              </div>
            </div>

            <div className="welcomeFeatureItem">
              <div className="featureIcon">
                <Bot size={20} />
              </div>
              <div>
                <strong>Cyber Safety Assistant</strong>
                <p>24/7 interactive guidance on account protection, OTP safety, and fraud prevention.</p>
              </div>
            </div>

            <div className="welcomeFeatureItem">
              <div className="featureIcon">
                <Shield size={20} />
              </div>
              <div>
                <strong>Role-Based Access</strong>
                <p>Open access for standard Users with personal logs, plus a dedicated Admin Control Center.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login/Register Card */}
        <div className="welcomeRight">
          <div className="authCard">
            {/* Role Selector Tabs */}
            <div className="roleSelector">
              <button
                type="button"
                className={`roleBtn ${roleMode === "user" ? "active" : ""}`}
                onClick={() => {
                  setRoleMode("user");
                  setError("");
                }}
              >
                <User size={16} /> User Login
              </button>
              <button
                type="button"
                className={`roleBtn ${roleMode === "admin" ? "active" : ""}`}
                onClick={() => {
                  setRoleMode("admin");
                  setError("");
                }}
              >
                <Shield size={16} /> Admin Portal
              </button>
            </div>

            {/* Mode Header */}
            <div className="authHeader">
              <h3>
                {roleMode === "admin"
                  ? authMode === "login"
                    ? "Administrator Sign In"
                    : "Admin Account Setup"
                  : authMode === "login"
                  ? "User Sign In"
                  : "Create User Account"}
              </h3>
              <p>
                {roleMode === "admin"
                  ? "Access restricted to authorized platform administrators."
                  : authMode === "login"
                  ? "Enter your email and password to access the threat scanner."
                  : "Any email and password can be used to create your user account."}
              </p>
            </div>

            {/* Admin Info Banner */}
            {roleMode === "admin" && (
              <div className="adminNotice">
                <div className="adminNoticeHeader">
                  <ShieldAlert size={16} />
                  <span>Authorized Admin Emails (2):</span>
                </div>
                <div className="adminEmailChips">
                  {adminEmails.map((em) => (
                    <span key={em} className="chip">
                      <CheckCircle2 size={12} /> {em}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && <div className="authError">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="authForm">
              {authMode === "register" && (
                <div className="formGroup">
                  <label>Full Name</label>
                  <div className="inputWrapper">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="formGroup">
                <label>Email Address</label>
                <div className="inputWrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder={
                      roleMode === "admin" ? adminEmails[0] || "admin@cybershield.ai" : "you@example.com"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {roleMode === "user" && (
                  <span className="fieldHint">User accounts can use any valid email address.</span>
                )}
              </div>

              <div className="formGroup">
                <label>Password</label>
                <div className="inputWrapper">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {authMode === "register" && (
                  <span className="fieldHint">Minimum 6 characters</span>
                )}
              </div>

              <button type="submit" className="submitBtn" disabled={loading}>
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    <span>
                      {authMode === "login"
                        ? roleMode === "admin"
                          ? "Log In as Administrator"
                          : "Sign In to CyberShield"
                        : "Create My Account"}
                    </span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Login / Register */}
            <div className="authFooter">
              {authMode === "login" ? (
                <p>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    className="linkBtn"
                    onClick={() => {
                      setAuthMode("register");
                      setError("");
                    }}
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="linkBtn"
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                    }}
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

            {/* Quick Demo Credentials Helper */}
            <div className="quickFillSection">
              <span className="quickFillTitle">Quick 1-Click Demo Login:</span>
              <div className="quickFillBtns">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("admin", adminEmails[0] || "admin@cybershield.ai", "Admin@12345")}
                >
                  Admin 1 (admin@cybershield.ai)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("admin", adminEmails[1] || "security@cybershield.ai", "Admin@12345")}
                >
                  Admin 2 (security@cybershield.ai)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("user", "user@cybershield.ai", "User@12345")}
                >
                  Demo User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
