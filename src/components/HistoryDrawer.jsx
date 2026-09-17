import React from "react";

function getTimelineCategory(ts) {
  const now = new Date();
  const date = new Date(ts);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const dayOfWeek = now.getDay();
  const startOfWeek = startOfToday - dayOfWeek * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  if (ts >= startOfToday) {
    return "Today";
  } else if (ts >= startOfYesterday) {
    return "Yesterday";
  } else if (ts >= startOfWeek) {
    return "This Week";
  } else if (ts >= startOfMonth) {
    return "This Month";
  } else {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    if (date.getFullYear() === now.getFullYear()) {
      return month;
    }
    return `${month} ${date.getFullYear()}`;
  }
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem
}) {
  if (!isOpen) return null;

  const [confirmState, setConfirmState] = React.useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null
  });

  const handleClearAll = () => {
    setConfirmState({
      isOpen: true,
      title: "Clear All History?",
      message: "This will permanently delete all saved calculations from history.",
      confirmLabel: "Clear All",
      onConfirm: () => {
        onClearHistory();
        setConfirmState({ isOpen: false });
      }
    });
  };

  const handleDeleteItem = (item, e) => {
    e.stopPropagation();
    setConfirmState({
      isOpen: true,
      title: "Remove Calculation?",
      message: `Delete "${item.expression} = ${item.result}" from history?`,
      confirmLabel: "Remove",
      onConfirm: () => {
        onDeleteHistoryItem(item.id);
        setConfirmState({ isOpen: false });
      }
    });
  };

  // Group history items by timeline category
  const groupedHistory = React.useMemo(() => {
    const groups = [];
    const map = new Map();

    history.forEach((item) => {
      const category = getTimelineCategory(item.timestamp);
      if (!map.has(category)) {
        map.set(category, []);
        groups.push(category);
      }
      map.get(category).push(item);
    });

    return groups.map((cat) => ({
      category: cat,
      items: map.get(cat)
    }));
  }, [history]);

  return (
    <div className="history-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="history-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="history-header">
          <div className="history-title-group">
            <span className="history-icon">🕒</span>
            <h2 className="history-title">History</h2>
            <span className="history-count-badge">{history.length}</span>
          </div>

          <div className="history-actions">
            {history.length > 0 && (
              <button
                className="history-clear-btn"
                onClick={handleClearAll}
                title="Clear all history"
              >
                Clear All
              </button>
            )}
            <button
              className="history-close-btn"
              onClick={onClose}
              aria-label="Close history"
              title="Close history"
            >
              ✕
            </button>
          </div>
        </div>

        {/* History List Grouped by Single Timeline */}
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              <span className="history-empty-icon">📝</span>
              <p className="history-empty-text">No calculations saved yet</p>
              <span className="history-empty-subtext">Completed calculations will automatically appear here</span>
            </div>
          ) : (
            groupedHistory.map((group) => (
              <div key={group.category} className="history-group">
                {/* Highlighted Timeline Day Header */}
                <div className="history-group-header">
                  <span className="history-timeline-highlight">{group.category}</span>
                </div>

                <div className="history-group-items">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="history-card"
                      onClick={() => onSelectHistory(item)}
                      title="Tap to restore calculation"
                    >
                      <div className="history-card-body">
                        <div className="history-expression">{item.expression}</div>
                        <div className="history-result">= {item.result}</div>
                      </div>

                      <button
                        className="history-card-btn delete"
                        onClick={(e) => handleDeleteItem(item, e)}
                        title="Delete calculation"
                        aria-label="Delete calculation"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* In-App Native-Style Confirmation Toast / Modal */}
        {confirmState.isOpen && (
          <div className="inapp-confirm-backdrop" onClick={() => setConfirmState({ isOpen: false })}>
            <div className="inapp-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="inapp-confirm-title">{confirmState.title}</h3>
              <p className="inapp-confirm-message">{confirmState.message}</p>
              <div className="inapp-confirm-actions">
                <button
                  className="inapp-confirm-btn cancel"
                  onClick={() => setConfirmState({ isOpen: false })}
                >
                  Cancel
                </button>
                <button
                  className="inapp-confirm-btn confirm"
                  onClick={() => {
                    if (confirmState.onConfirm) confirmState.onConfirm();
                  }}
                >
                  {confirmState.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
