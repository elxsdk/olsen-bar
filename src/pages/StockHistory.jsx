import { useState, useEffect } from 'react';
import { History, Calendar, Download } from 'lucide-react';
import { getStockOpnameHistory, getTodayDate, formatNumber } from '../data/stockData';
import * as XLSX from 'xlsx';

export default function StockHistory() {
  const [history, setHistory] = useState([]);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last 7 days
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(getTodayDate());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [fromDate, toDate]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getStockOpnameHistory(fromDate, toDate);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (history.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }

    // Prepare data for Excel
    const excelData = history.map(record => ({
      'Tanggal': record.opname_date,
      'Kategori': record.category,
      'Item': record.name,
      'Unit': record.unit,
      'Last Stock': record.beginning_stock,
      'IN': record.stock_in,
      'Expected': record.expected_stock,
      'Actual': record.actual_stock,
      'OUT': record.stock_out,
      'Variance': record.variance
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Opname History');
    
    XLSX.writeFile(wb, `stock-opname-${fromDate}-${toDate}.xlsx`);
  };

  // Group by date
  const groupedHistory = history.reduce((acc, record) => {
    if (!acc[record.opname_date]) {
      acc[record.opname_date] = [];
    }
    acc[record.opname_date].push(record);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary))',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--color-bg-tertiary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div>
            <h2 style={{
              margin: '0 0 var(--spacing-xs) 0',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-accent-primary)'
            }}>
              <History size={24} style={{ verticalAlign: 'middle', marginRight: 'var(--spacing-xs)' }} />
              Stock Opname History
            </h2>
            <p style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-base)'
            }}>
              Riwayat stock opname dan laporan
            </p>
          </div>
          <button
            onClick={exportToExcel}
            disabled={history.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: history.length === 0 ? 'var(--color-bg-tertiary)' : 'var(--color-accent-primary)',
              color: history.length === 0 ? 'var(--color-text-muted)' : '#000',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              transition: 'all 0.2s',
              opacity: history.length === 0 ? 0.5 : 1
            }}
          >
            <Download size={20} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--color-bg-tertiary)',
        display: 'flex',
        gap: 'var(--spacing-md)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Calendar size={20} color="var(--color-accent-primary)" />
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flex: 1 }}>
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Dari:
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={toDate}
            style={{
              padding: 'var(--spacing-sm)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)'
            }}
          />
          <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Sampai:
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min={fromDate}
            max={getTodayDate()}
            style={{
              padding: 'var(--spacing-sm)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)'
            }}
          />
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {history.length} records
        </div>
      </div>

      {/* History List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Loading...
        </div>
      ) : history.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-xl)',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--color-bg-tertiary)'
        }}>
          <History size={48} color="var(--color-text-muted)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Tidak ada data stock opname untuk periode yang dipilih
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {Object.entries(groupedHistory).reverse().map(([date, records]) => (
            <div key={date}>
              <h3 style={{
                margin: '0 0 var(--spacing-md) 0',
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-accent-primary)',
                fontWeight: 600
              }}>
                {new Date(date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-bg-tertiary)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    <thead>
                      <tr style={{ background: 'var(--color-bg-tertiary)' }}>
                        <th style={tableHeaderStyle}>Kategori</th>
                        <th style={tableHeaderStyle}>Item</th>
                        <th style={tableHeaderStyle}>Last Stock</th>
                        <th style={tableHeaderStyle}>IN</th>
                        <th style={tableHeaderStyle}>Actual</th>
                        <th style={tableHeaderStyle}>OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, idx) => (
                        <tr key={record.id} style={{ 
                          borderBottom: idx < records.length - 1 ? '1px solid var(--color-bg-tertiary)' : 'none' 
                        }}>
                          <td style={tableCellStyle}>{record.category}</td>
                          <td style={tableCellStyle}>{record.name}</td>
                          <td style={tableCellStyle}>{formatNumber(record.beginning_stock)} {record.unit}</td>
                          <td style={tableCellStyle}>{formatNumber(record.stock_in)} {record.unit}</td>
                          <td style={tableCellStyle}>{formatNumber(record.actual_stock)} {record.unit}</td>
                          <td style={{
                            ...tableCellStyle,
                            color: record.stock_out < 0 ? '#dc2626' : 'var(--color-accent-primary)',
                            fontWeight: 600
                          }}>
                            {formatNumber(record.stock_out)} {record.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: 'var(--spacing-sm) var(--spacing-md)',
  textAlign: 'left',
  color: 'var(--color-text-primary)',
  fontWeight: 600,
  whiteSpace: 'nowrap'
};

const tableCellStyle = {
  padding: 'var(--spacing-sm) var(--spacing-md)',
  color: 'var(--color-text-secondary)'
};
