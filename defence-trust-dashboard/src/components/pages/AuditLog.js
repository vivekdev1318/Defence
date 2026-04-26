import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import './AuditLog.css';

export function AuditLog({ setToast }) {
  const { devices, auditEntries } = useContext(AppContext);
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
  const [filterDevice, setFilterDevice] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const filteredEntries = useMemo(() => {
    let filtered = auditEntries;

    if (showSuspiciousOnly) {
      filtered = filtered.filter(e => e.isSuspicious);
    }

    if (filterDevice !== 'All') {
      filtered = filtered.filter(e => e.device === filterDevice);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.action.toLowerCase().includes(search) ||
        e.details.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [auditEntries, showSuspiciousOnly, filterDevice, searchTerm]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const suspiciousCount = auditEntries.filter(e => e.isSuspicious).length;
  const devicesInvolved = new Set(auditEntries.map(e => e.device)).size;
  const lastUpdated = auditEntries.length > 0
    ? new Date(auditEntries[0].timestamp).toLocaleTimeString()
    : 'N/A';

  const handleExportCSV = () => {
    const csvContent = [
      ['Device', 'Action', 'Details', 'Timestamp', 'Suspicious', 'Block Number', 'Tx Hash'],
      ...filteredEntries.map(e => [
        e.device,
        e.action,
        e.details,
        new Date(e.timestamp).toLocaleString(),
        e.isSuspicious ? 'Yes' : 'No',
        e.blockNumber,
        e.txHash
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setToast({ message: 'Audit log exported as CSV', type: 'success' });
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Immutable blockchain transaction records</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{auditEntries.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Suspicious</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>
            {suspiciousCount}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Devices Involved</div>
          <div className="stat-value">{devicesInvolved}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Last Updated</div>
          <div className="stat-value text-sm">{lastUpdated}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showSuspiciousOnly}
              onChange={(e) => {
                setShowSuspiciousOnly(e.target.checked);
                setCurrentPage(1);
              }}
            />
            <span>Suspicious Only</span>
          </label>
        </div>

        <div className="filter-group">
          <label>Filter by Device</label>
          <select
            value={filterDevice}
            onChange={(e) => {
              setFilterDevice(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option>All</option>
            {[...new Set(auditEntries.map(e => e.device))].map(device => (
              <option key={device} value={device}>{device}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <input
            type="text"
            placeholder="Search action or details..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <button className="btn-primary btn-small" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
      </div>

      {/* Table */}
      {filteredEntries.length === 0 ? (
        <div className="empty-state">No audit entries found</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Device</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.map((entry, idx) => (
                  <tr key={idx} className={entry.isSuspicious ? 'suspicious-row' : ''}>
                    <td className="row-number">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="monospace">{entry.device}</td>
                    <td className="text-bold">{entry.action}</td>
                    <td className="text-sm">{entry.details.slice(0, 50)}...</td>
                    <td className="text-dim text-sm">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <span className={`badge ${entry.isSuspicious ? 'badge-suspicious' : 'badge-ok'}`}>
                        {entry.isSuspicious ? 'SUSPICIOUS' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-secondary btn-small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <button
                className="btn-secondary btn-small"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
