import React, { useState, useEffect } from 'react';
import { Badge } from '../common/Badge';
import { 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  ArrowUpDown, 
  RefreshCw, 
  Key, 
  Copy, 
  Check, 
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const DataTable = ({
  schema,
  data = [],
  loading = false,
  onRefresh,
  onCreate,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState({});
  const itemsPerPage = 8;

  // Reset pagination on schema change
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setFilterValue('ALL');
  }, [schema?.id]);

  if (!schema) {
    return (
      <div className="p-8 text-center text-slate-400">
        No schema metadata provided for data table.
      </div>
    );
  }

  // Determine selectable filter column if available (e.g., 'billing_cycle', 'channel', 'status')
  const filterableField = schema.fields?.find(f => f.type === 'select');

  // Filter & Search Logic
  const filteredData = data.filter(row => {
    // 1. Text search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || schema.table_columns.some(col => {
      const val = row[col.key];
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(searchLower);
      return String(val).toLowerCase().includes(searchLower);
    });

    // 2. Select Filter
    let matchesFilter = true;
    if (filterableField && filterValue !== 'ALL') {
      matchesFilter = String(row[filterableField.key]) === String(filterValue);
    }

    return matchesSearch && matchesFilter;
  });

  // Sorting Logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    let valA = a[sortColumn];
    let valB = b[sortColumn];

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
    return sortDirection === 'asc' ? valA - valB : valB - valA;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleCopyKey = (keyText, rowId) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(rowId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleRevealKey = (rowId) => {
    setRevealedKeys(prev => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const headers = schema.table_columns.map(c => c.label).join(',');
    const rows = filteredData.map(row => {
      return schema.table_columns.map(c => {
        let val = row[c.key];
        if (typeof val === 'object') val = JSON.stringify(val);
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${schema.id}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper cell formatter
  const renderCellContent = (row, column) => {
    const value = row[column.key];

    if (value === null || value === undefined) {
      return <span className="text-slate-400 italic text-xs">—</span>;
    }

    switch (column.format) {
      case 'currency':
        return (
          <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
            ${Number(value).toFixed(2)}
          </span>
        );

      case 'badge':
        return <Badge variant={value}>{value}</Badge>;

      case 'json_count':
        const featureCount = value && typeof value === 'object' ? Object.keys(value).length : 0;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {featureCount} feature rules
          </span>
        );

      case 'channel_config':
        const channel = row.channel;
        if (channel === 'Email') {
          return (
            <div className="text-xs max-w-xs truncate">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Subject: </span>
              <span className="text-slate-500">{value?.subject || 'N/A'}</span>
            </div>
          );
        } else if (channel === 'SMS') {
          return (
            <div className="text-xs max-w-xs truncate">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Text: </span>
              <span className="text-slate-500 font-mono">{value?.message_text || 'N/A'}</span>
            </div>
          );
        }
        return <span className="text-xs font-mono text-slate-500">{JSON.stringify(value)}</span>;

      case 'masked_key':
        const isRevealed = revealedKeys[row.id];
        const displayKey = isRevealed ? value : `${value.substring(0, 10)}••••••••`;
        return (
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-800 dark:text-slate-200">
              {displayKey}
            </span>
            <button
              onClick={() => toggleRevealKey(row.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title={isRevealed ? "Hide Key" : "Reveal Key"}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleCopyKey(value, row.id)}
              className="text-slate-400 hover:text-brand-500"
              title="Copy API Key"
            >
              {copiedKey === row.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        );

      case 'datetime':
        return (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {new Date(value).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        );

      default:
        return <span className="text-sm text-slate-800 dark:text-slate-200">{String(value)}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar: Search, Filters & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        <div className="flex items-center space-x-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${schema.plural_name.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Select Filter Dropdown */}
          {filterableField && filterableField.options && (
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">All {filterableField.label}s</option>
                {filterableField.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onCreate}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New {schema.name}</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {schema.table_columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-3.5 ${col.sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white' : ''}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{col.label}</span>
                      {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={schema.table_columns.length + 1} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                    <span className="text-xs font-medium">Fetching {schema.plural_name}...</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={schema.table_columns.length + 1} className="py-12 text-center text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-semibold">No {schema.plural_name.toLowerCase()} found</p>
                    <p className="text-xs text-slate-500">Try adjusting your search criteria or create a new record.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map(row => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    {schema.table_columns.map(col => (
                      <td key={col.key} className="px-4 py-3.5">
                        {renderCellContent(row, col)}
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-850/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{paginatedData.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{filteredData.length}</strong> records
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium font-mono text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
