import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, UploadCloud, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { leadsApi } from '@/api/client';
import { Button } from '@/components/ui/button';
import { LeadKPIStrip } from '@/components/leads/LeadKPIStrip';
import { LeadTable, type Lead } from '@/components/leads/LeadTable';
import { LeadCardMobile } from '@/components/leads/LeadCardMobile';
import { CSVImportModal } from '@/components/leads/CSVImportModal';
import { LeadModal } from '@/components/leads/LeadModal';
import { BulkActionBar } from '@/components/leads/BulkActionBar';
import { cn } from '@/lib/utils';

const DEFAULT_LEADS: Lead[] = [
  { id: 1, name: 'Arjun Sharma', phone: '+91 98XXX XX210', email: 'arjun@example.com', company: '', city: 'Gurugram', source: 'Meta Ad', status: 'QUALIFIED', score: 91, tag: 'Hot', value: '₹1.4 Cr', agent: 'Rahul Verma', created: '18 Oct 2026', lastContact: '1h ago', notes: 'Interested in 3BHK, prefers east-facing. Budget confirmed.' },
  { id: 2, name: 'Priya Mehta', phone: '+91 87XXX XX345', email: 'priya@mehta.co', company: 'Mehta & Associates', city: 'Delhi', source: 'Organic', status: 'CONTACTED', score: 72, tag: 'Qualified', value: '₹1.2 Cr', agent: 'Sneha Patel', created: '17 Oct 2026', lastContact: '8h ago', notes: 'Commercial investment, wants rental yield info.' },
  { id: 3, name: 'Rohit Gupta', phone: '+91 76XXX XX901', email: '', company: '', city: 'Noida', source: '99acres', status: 'NEW', score: 45, tag: 'Warm', value: '₹80L', agent: 'Amit Sharma', created: '19 Oct 2026', lastContact: '15m ago', notes: '' },
  { id: 4, name: 'Sunita Bose', phone: '+91 98XXX XX034', email: 'sunita.bose@gmail.com', company: '', city: 'Gurugram', source: 'Meta Ad', status: 'QUALIFIED', score: 88, tag: 'Hot', value: '₹95L', agent: 'Rahul Verma', created: '18 Oct 2026', lastContact: '1h ago', notes: 'Urgent, needs carpet area clarity. CTWA lead.' },
  { id: 5, name: 'Vikram Joshi', phone: '+91 91XXX XX567', email: 'vjoshi@corp.in', company: 'Joshi Corp', city: 'Ghaziabad', source: 'MagicBricks', status: 'NEW', score: 38, tag: 'Cold', value: '₹60L', agent: 'Divya Nair', created: '20 Oct 2026', lastContact: '2h ago', notes: '' },
  { id: 6, name: 'Kavita Reddy', phone: '+91 88XXX XX221', email: 'kavita@reddy.family', company: '', city: 'Gurugram', source: 'Meta Ad', status: 'QUALIFIED', score: 95, tag: 'Hot', value: '₹3.2 Cr', agent: 'Rahul Verma', created: '19 Oct 2026', lastContact: '30m ago', notes: 'Penthouse only. Has existing property to sell. Serious buyer.' },
  { id: 7, name: 'Rajesh Nair', phone: '+91 77XXX XX889', email: '', company: '', city: 'Bengaluru', source: 'Housing.com', status: 'CONTACTED', score: 68, tag: 'Warm', value: '₹1.1 Cr', agent: 'Sneha Patel', created: '16 Oct 2026', lastContact: '5h ago', notes: 'Relocation from Bangalore. Timeline: 3 months.' },
  { id: 8, name: 'Neha Khanna', phone: '+91 99XXX XX112', email: 'neha@khanna.in', company: '', city: 'Pune', source: 'JustDial', status: 'NEW', score: 29, tag: 'Cold', value: '₹55L', agent: 'Karan Mehra', created: '20 Oct 2026', lastContact: '1d ago', notes: '' },
];

const ITEMS_PER_PAGE = 8;

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null | 'new'>(null);
  const [sortField, setSortField] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leadsList, setLeadsList] = useState<Lead[]>(DEFAULT_LEADS);
  const [currentPage, setCurrentPage] = useState(1);

  const loadLeads = async () => {
    try {
      const data = await leadsApi.getLeads();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Lead[] = data.map((l: any) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email || '',
          company: '',
          city: l.city || 'Gurugram',
          source: l.source || (l.isCtwa ? 'Meta CTWA Ad' : 'Organic WhatsApp'),
          status: l.status || 'NEW',
          score: l.intentScore ?? 75,
          tag: (l.intentScore ?? 75) >= 80 ? 'Hot' : 'Qualified',
          value: l.estimatedValueINR > 0 ? `₹${(l.estimatedValueINR / 100000).toFixed(0)}L` : '₹1.4 Cr',
          agent: l.assignedAgent?.name || 'Rahul Verma',
          created: new Date(l.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          lastContact: 'Active',
          notes: l.tags?.join(', ') || '',
        }));
        setLeadsList(prev => {
          const existingIds = new Set(mapped.map(m => String(m.id)));
          return [...mapped, ...prev.filter(p => !existingIds.has(String(p.id)))];
        });
      }
    } catch {
      // keep fallback
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filtered = useMemo(() => {
    return leadsList
      .filter(l => {
        const q = search.toLowerCase();
        const matchSearch = 
          l.name.toLowerCase().includes(q) || 
          l.phone.includes(q) || 
          l.city.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'ALL' || l.status.toUpperCase() === statusFilter.toUpperCase();
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const modifier = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'score') return (a.score - b.score) * modifier;
        if (sortField === 'name') return a.name.localeCompare(b.name) * modifier;
        return 0;
      });
  }, [leadsList, search, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const toggleSelect = (id: number | string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const selectAll = () => {
    if (selected.length === paginatedLeads.length) {
      setSelected([]);
    } else {
      setSelected(paginatedLeads.map(l => l.id));
    }
  };

  const filters = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];

  return (
    <div className="w-full space-y-4">
      {/* CSV Import Modal */}
      {showImport && (
        <CSVImportModal 
          isOpen={showImport} 
          onClose={() => setShowImport(false)} 
          onSuccess={loadLeads} 
        />
      )}

      {/* Lead Create/Edit Modal */}
      {editingLead !== null && (
        <LeadModal
          lead={editingLead === 'new' ? undefined : editingLead}
          onClose={() => setEditingLead(null)}
          onSave={loadLeads}
        />
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar 
        count={selected.length} 
        onClear={() => setSelected([])} 
      />

      {/* 5-Card KPI Strip */}
      <LeadKPIStrip leads={leadsList} />

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-surface-card p-3 rounded-md border border-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-canvas border border-border rounded-sm pl-9 pr-3 py-1.5 text-xs text-primary placeholder:text-tertiary focus:outline-none focus:border-border-strong font-mono"
            placeholder="Search leads, phone, city, source..."
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          {filters.map(s => {
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-mono rounded-sm transition-all whitespace-nowrap",
                  isActive
                    ? "bg-accent text-black font-semibold shadow-sm"
                    : "text-tertiary hover:text-primary hover:bg-surface-hover"
                )}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Actions & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortField}
              onChange={e => handleSort(e.target.value)}
              className="bg-canvas border border-border text-tertiary text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-border-strong cursor-pointer font-mono"
              aria-label="Sort leads by"
            >
              <option value="score">Sort: Intent Score</option>
              <option value="name">Sort: Prospect Name</option>
            </select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowImport(true)}
            className="font-mono text-xs gap-1.5 h-8"
          >
            <UploadCloud size={13} />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditingLead('new')}
            className="font-mono text-xs font-semibold gap-1.5 h-8"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New Lead</span>
          </Button>
        </div>
      </div>

      {/* Desktop & Tablet: Semantic HTML Table */}
      <div className="hidden md:block">
        <LeadTable
          leads={paginatedLeads}
          selected={selected}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          onEdit={l => setEditingLead(l)}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>

      {/* Mobile: Responsive Card Stream */}
      <div className="md:hidden space-y-2.5">
        {paginatedLeads.map(lead => (
          <LeadCardMobile
            key={lead.id}
            lead={lead}
            isSelected={selected.includes(lead.id)}
            onToggleSelect={toggleSelect}
            onEdit={l => setEditingLead(l)}
          />
        ))}
        {paginatedLeads.length === 0 && (
          <div className="text-center py-12 text-tertiary font-mono text-xs bg-surface-card rounded-md border border-border">
            No leads matching filter
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 pt-2 text-xs font-mono text-tertiary">
        <div>
          Showing <span className="text-primary font-semibold tabular-nums">{Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> to{' '}
          <span className="text-primary font-semibold tabular-nums">{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)}</span> of{' '}
          <span className="text-primary font-semibold tabular-nums">{filtered.length}</span> leads
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className="h-7 w-7 p-0"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="px-2 text-xs text-primary tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="h-7 w-7 p-0"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
