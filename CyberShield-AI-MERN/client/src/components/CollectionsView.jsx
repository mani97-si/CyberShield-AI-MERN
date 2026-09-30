import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderPlus,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Plus,
  ExternalLink,
  Calendar,
  X,
  RefreshCw
} from "lucide-react";

export default function CollectionsView({ API, token }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState("#28c7a4");
  const [activeScanDetail, setActiveScanDetail] = useState(null);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/collections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
        if (selectedCollection) {
          const updated = data.find((c) => c._id === selectedCollection._id);
          setSelectedCollection(updated || (data.length > 0 ? data[0] : null));
        } else if (data.length > 0) {
          setSelectedCollection(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [token]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      const res = await fetch(`${API}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newColName.trim(),
          description: newColDesc.trim(),
          color: newColColor
        })
      });

      if (res.ok) {
        const created = await res.json();
        setCollections([created, ...collections]);
        setSelectedCollection(created);
        setShowCreateModal(false);
        setNewColName("");
        setNewColDesc("");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create collection.");
      }
    } catch {
      alert("Error creating collection.");
    }
  };

  const handleDeleteCollection = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the collection "${name}"?`)) return;

    try {
      const res = await fetch(`${API}/collections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const remaining = collections.filter((c) => c._id !== id);
        setCollections(remaining);
        if (selectedCollection?._id === id) {
          setSelectedCollection(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch {
      alert("Failed to delete collection.");
    }
  };

  const handleRemoveScan = async (collectionId, scanId) => {
    try {
      const res = await fetch(`${API}/collections/${collectionId}/scans/${scanId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedCollection(updated);
        setCollections(collections.map((c) => (c._id === updated._id ? updated : c)));
      }
    } catch {
      alert("Failed to remove scan from collection.");
    }
  };

  const colorPresets = ["#28c7a4", "#ff6b7b", "#ffd166", "#3b82f6", "#a855f7", "#ec4899"];

  return (
    <section className="collectionsSection">
      {/* Header Banner */}
      <div className="hero collectionsHero">
        <div>
          <span className="pill">● PERSONAL THREAT VAULT</span>
          <h2>My Threat Collections</h2>
          <p>
            Organize, categorize, and preserve your analyzed threats, malicious links, and verified safe sites.
            All collections and history are strictly private to your account.
          </p>
        </div>
        <div className="heroShield">
          <FolderOpen size={82} />
        </div>
      </div>

      <div className="collectionsLayout">
        {/* Left: Collections Sidebar List */}
        <div className="collectionsSidebar panel">
          <div className="panelTitle">
            <div>
              <b>Collections ({collections.length})</b>
              <span>Custom threat folders</span>
            </div>
            <button
              className="primary createColBtn"
              onClick={() => setShowCreateModal(true)}
              title="New Collection"
            >
              <Plus size={15} /> New
            </button>
          </div>

          {loading ? (
            <div className="empty">
              <RefreshCw size={28} className="spin" />
              <span>Loading folders...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="empty">
              <Folder size={32} />
              <b>No collections</b>
              <button className="primary" onClick={() => setShowCreateModal(true)}>
                Create Collection
              </button>
            </div>
          ) : (
            <div className="colList">
              {collections.map((col) => {
                const isSelected = selectedCollection?._id === col._id;
                return (
                  <div
                    key={col._id}
                    className={`colItem ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedCollection(col)}
                  >
                    <div className="colItemLeft">
                      <div className="colDot" style={{ background: col.color || "#28c7a4" }} />
                      <div className="colItemInfo">
                        <strong>{col.name}</strong>
                        <small>{col.scans?.length || 0} items</small>
                      </div>
                    </div>
                    {isSelected && collections.length > 1 && (
                      <button
                        className="deleteColBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(col._id, col.name);
                        }}
                        title="Delete collection"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Collection Details & Scans */}
        <div className="collectionsContent panel">
          {selectedCollection ? (
            <>
              <div className="selectedColHeader">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      className="colBadgeCircle"
                      style={{ background: selectedCollection.color || "#28c7a4" }}
                    />
                    <h2 style={{ margin: 0, fontSize: "20px" }}>{selectedCollection.name}</h2>
                    <span className="scanCountBadge">
                      {selectedCollection.scans?.length || 0} saved threats
                    </span>
                  </div>
                  {selectedCollection.description && (
                    <p className="selectedColDesc">{selectedCollection.description}</p>
                  )}
                </div>
              </div>

              {/* Scans List inside Collection */}
              {!selectedCollection.scans || selectedCollection.scans.length === 0 ? (
                <div className="empty" style={{ minHeight: "240px" }}>
                  <Folder size={42} />
                  <b>Collection is empty</b>
                  <span>
                    Save scans to this collection directly from the AI Threat Scanner or your Scan History.
                  </span>
                </div>
              ) : (
                <div className="history" style={{ marginTop: "14px" }}>
                  {selectedCollection.scans.map((scan) => {
                    if (!scan || !scan._id) return null;
                    return (
                      <div className="historyItem" key={scan._id}>
                        <div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <b className={`classificationTag ${scan.classification?.toLowerCase()}`}>
                              {scan.classification}
                            </b>
                            <span className="scanTypeTag">{scan.type?.toUpperCase()}</span>
                          </div>
                          <span>
                            Added on: {new Date(scan.createdAt).toLocaleDateString()}
                          </span>
                          <small title={scan.input}>{scan.input}</small>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <strong className={`scoreMini ${scan.classification?.toLowerCase()}`}>
                            {scan.score}/100
                          </strong>
                          <button
                            className="iconBtn"
                            onClick={() => setActiveScanDetail(scan)}
                            title="View Full Analysis"
                          >
                            <ExternalLink size={15} />
                          </button>
                          <button
                            className="deleteBtn"
                            onClick={() => handleRemoveScan(selectedCollection._id, scan._id)}
                            title="Remove from this collection"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <FolderOpen size={48} />
              <b>No collection selected</b>
              <span>Choose a collection on the left or create a new one.</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating Collection */}
      {showCreateModal && (
        <div className="modalOverlay" onClick={() => setShowCreateModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Create New Collection</h3>
              <button className="iconBtn" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateCollection} className="modalForm">
              <div className="formGroup">
                <label>Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g. Critical Phishing Emails"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="formGroup">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Threat reports for security audit"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label>Folder Color</label>
                <div className="colorPickerRow">
                  {colorPresets.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`colorDotBtn ${newColColor === c ? "active" : ""}`}
                      style={{ background: c }}
                      onClick={() => setNewColColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="modalActions">
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal for Scanned Threat */}
      {activeScanDetail && (
        <div className="modalOverlay" onClick={() => setActiveScanDetail(null)}>
          <div className="modalContent detailModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div
                  className={`scoreCircle ${activeScanDetail.classification?.toLowerCase()}`}
                >
                  {activeScanDetail.score}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Threat Analysis Report</h3>
                  <small style={{ color: "#7a93ac" }}>
                    {activeScanDetail.type?.toUpperCase()} • {activeScanDetail.threatCategory}
                  </small>
                </div>
              </div>
              <button className="iconBtn" onClick={() => setActiveScanDetail(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="detailBody">
              <div className="detailInputBox">
                <strong>Analyzed Content:</strong>
                <code>{activeScanDetail.input}</code>
              </div>

              {activeScanDetail.indicators?.length > 0 && (
                <div className="detailSection">
                  <strong>Detected Threat Indicators:</strong>
                  <ul>
                    {activeScanDetail.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeScanDetail.recommendations?.length > 0 && (
                <div className="detailSection">
                  <strong>Recommended Actions:</strong>
                  <ul>
                    {activeScanDetail.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
