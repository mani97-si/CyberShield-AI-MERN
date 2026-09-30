import React, { useEffect, useState } from "react";
import { Users, Shield, Calendar, Search, RefreshCw, CheckCircle, ShieldAlert } from "lucide-react";

export default function AdminUsers({ API, token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEmails, setAdminEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uRes, aRes] = await Promise.all([
        fetch(`${API}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API}/auth/admin-emails`)
      ]);

      if (uRes.ok) {
        const data = await uRes.json();
        setUsers(data);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAdminEmails(aData.adminEmails || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="adminSection">
      <div className="hero adminHero">
        <div>
          <span className="pill">● ADMINISTRATOR CONTROL CENTER</span>
          <h2>System Users & Access Management</h2>
          <p>
            Review all registered accounts, role authorizations, and scan activities across the platform.
          </p>
        </div>
        <div className="heroShield">
          <Shield size={76} />
        </div>
      </div>

      <div className="adminEmailBanner">
        <div className="adminEmailTitle">
          <ShieldAlert size={20} />
          <b>Designated Administrator Emails:</b>
        </div>
        <div className="adminEmailList">
          {adminEmails.map((email) => (
            <span key={email} className="adminEmailTag">
              <CheckCircle size={14} /> {email}
            </span>
          ))}
        </div>
        <small>Only these two emails possess system administrator privileges and access to this control center.</small>
      </div>

      <div className="panel" style={{ marginTop: "20px" }}>
        <div className="panelTitle">
          <div>
            <b>Registered Users ({filteredUsers.length})</b>
            <span>Manage accounts and review usage</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="searchBox">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="iconBtn" onClick={fetchUsers} title="Refresh Users" disabled={loading}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty">
            <RefreshCw size={36} className="spin" />
            <b>Loading user accounts...</b>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty">
            <Users size={36} />
            <b>No users found</b>
            <span>No registered users match your criteria.</span>
          </div>
        ) : (
          <div className="userTableWrapper">
            <table className="userTable">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Scans Run</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="userAvatarCell">
                        <div className={`avatarCircle ${u.role}`}>
                          {u.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="userName">{u.name}</span>
                      </div>
                    </td>
                    <td className="userEmail">{u.email}</td>
                    <td>
                      <span className={`roleBadge ${u.role}`}>
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <span className="scanCountBadge">{u.scanCount || 0} scans</span>
                    </td>
                    <td>
                      <span className="joinDate">
                        <Calendar size={13} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
