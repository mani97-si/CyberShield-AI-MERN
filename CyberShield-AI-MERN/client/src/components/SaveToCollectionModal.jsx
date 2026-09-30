import React, { useState, useEffect } from "react";
import { FolderPlus, Check, X, Plus } from "lucide-react";

export default function SaveToCollectionModal({ API, token, scan, onClose, onSuccess }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColId, setSelectedColId] = useState("");
  const [saving, setSaving] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetch(`${API}/collections`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCollections(data);
          if (data.length > 0) {
            setSelectedColId(data[0]._id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API, token]);

  const handleSave = async () => {
    if (!selectedColId && !newColName.trim()) {
      setStatusMsg("Please select or create a collection.");
      return;
    }

    setSaving(true);
    setStatusMsg("");

    try {
      let targetId = selectedColId;

      // If user wants to create a new collection first
      if (showCreateNew && newColName.trim()) {
        const createRes = await fetch(`${API}/collections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newColName.trim() })
        });
        if (!createRes.ok) {
          throw new Error("Failed to create new collection.");
        }
        const created = await createRes.json();
        targetId = created._id;
      }

      // Add scan to target collection
      const res = await fetch(`${API}/collections/${targetId}/scans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scanId: scan._id })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to add scan to collection.");
      }

      setStatusMsg("Saved successfully!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setStatusMsg(err.message || "Error saving scan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <FolderPlus size={20} color="#28c7a4" />
            <h3 style={{ margin: 0 }}>Save Threat to Collection</h3>
          </div>
          <button className="iconBtn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modalBody" style={{ padding: "16px 0" }}>
          <div className="scanPreviewMini">
            <span className={`pill ${scan.classification?.toLowerCase()}`}>
              {scan.classification} ({scan.score}/100)
            </span>
            <small title={scan.input}>{scan.input}</small>
          </div>

          {loading ? (
            <p style={{ color: "#7b94ad", fontSize: "13px" }}>Loading your collections...</p>
          ) : (
            <>
              {!showCreateNew ? (
                <div className="formGroup" style={{ marginTop: "12px" }}>
                  <label>Select Target Collection:</label>
                  <div className="collectionRadioList">
                    {collections.map((col) => (
                      <label
                        key={col._id}
                        className={`colRadioItem ${selectedColId === col._id ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="collectionSelect"
                          value={col._id}
                          checked={selectedColId === col._id}
                          onChange={() => setSelectedColId(col._id)}
                        />
                        <span className="colDot" style={{ background: col.color || "#28c7a4" }} />
                        <span className="colName">{col.name}</span>
                        <span className="colCount">({col.scans?.length || 0})</span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="linkBtn"
                    style={{ marginTop: "10px", fontSize: "12px" }}
                    onClick={() => setShowCreateNew(true)}
                  >
                    + Or create a new collection
                  </button>
                </div>
              ) : (
                <div className="formGroup" style={{ marginTop: "12px" }}>
                  <label>New Collection Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Critical Threat Warnings"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="linkBtn"
                    style={{ marginTop: "10px", fontSize: "12px" }}
                    onClick={() => setShowCreateNew(false)}
                  >
                    Back to existing collections
                  </button>
                </div>
              )}
            </>
          )}

          {statusMsg && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: statusMsg.includes("success") ? "#28c7a4" : "#ff7b88"
              }}
            >
              {statusMsg}
            </p>
          )}
        </div>

        <div className="modalActions">
          <button type="button" className="cancelBtn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save to Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}
