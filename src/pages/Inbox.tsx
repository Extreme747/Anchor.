import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, X } from 'lucide-react';
import { LeadList } from '@/components/inbox/LeadList';
import { ChatPanel } from '@/components/inbox/ChatPanel';
import { IntelPanel } from '@/components/inbox/IntelPanel';
import { SimulatorModal } from '@/components/inbox/SimulatorModal';
import { leadsApi } from '@/api/client';
import { Button } from '@/components/ui/button';

// ── Default Fallback Data for High-Ticket Real Estate CRM
const DEFAULT_LEADS = [
  { id: '1', name: 'Arjun Sharma', phone: '+91 98XXX XX210', preview: 'Bhai site visit kab kar sakte... Budget ready hai', time: '1m', score: 91, tag: 'Hot', status: 'NEW', value: '₹1.4 Cr', source: 'Meta Ad', city: 'Gurugram', unread: 3, ctwa: true, tags: ['Hot 🔥', '3BHK', 'Sec 62'] },
  { id: '2', name: 'Priya Mehta', phone: '+91 87XXX XX345', preview: 'Interested in 3BHK, budget 1.2Cr all-inclusive', time: '8m', score: 74, tag: 'Qualified', status: 'CONTACTED', value: '₹1.2 Cr', source: 'Organic', city: 'Delhi', unread: 0, ctwa: false, tags: ['Qualified', 'Golf Course Ext'] },
  { id: '3', name: 'Sunita Bose', phone: '+91 98XXX XX034', preview: 'Urgent — need carpet area details today', time: '15m', score: 88, tag: 'Hot', status: 'QUALIFIED', value: '₹95L', source: 'Meta Ad', city: 'Gurugram', unread: 1, ctwa: true, tags: ['Hot 🔥', 'Ready to Move'] },
  { id: '4', name: 'Rohit Gupta', phone: '+91 76XXX XX901', preview: 'Send me brochure and payment plan please', time: '22m', score: 45, tag: 'Warm', status: 'NEW', value: '₹80L', source: '99acres', city: 'Noida', unread: 0, ctwa: false, tags: ['Warm', 'Brochure Sent'] },
  { id: '5', name: 'Kavita Reddy', phone: '+91 88XXX XX221', preview: 'Penthouse availability batao with terrace view', time: '1h', score: 95, tag: 'Hot', status: 'QUALIFIED', value: '₹3.2 Cr', source: 'Meta Ad', city: 'Gurugram', unread: 2, ctwa: true, tags: ['VIP', 'Penthouse', '₹3.2 Cr'] },
  { id: '6', name: 'Vikram Joshi', phone: '+91 91XXX XX567', preview: 'Kya immediate possession units hain?', time: '2h', score: 38, tag: 'Cold', status: 'NEW', value: '₹60L', source: 'MagicBricks', city: 'Ghaziabad', unread: 0, ctwa: false, tags: ['Cold'] },
  { id: '7', name: 'Rajesh Nair', phone: '+91 77XXX XX889', preview: 'Site visit this Saturday possible with family?', time: '5h', score: 68, tag: 'Warm', status: 'CONTACTED', value: '₹1.1 Cr', source: 'Housing.com', city: 'Bengaluru', unread: 0, ctwa: false, tags: ['Warm', 'Visit Pending'] },
];

export default function Inbox() {
  const [leads, setLeads] = useState<any[]>(DEFAULT_LEADS);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_LEADS[0].id);
  const [filter, setFilter] = useState('All');
  const [showSimModal, setShowSimModal] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showIntelDrawer, setShowIntelDrawer] = useState(false);

  const loadLeads = () => {
    leadsApi.getLeads()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          setLeads(data);
          if (!data.some(l => String(l.id) === String(selectedId))) {
            setSelectedId(String(data[0].id));
          }
        }
      })
      .catch(() => {
        // graceful fallback to default mock leads
      });
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const selectedLead = leads.find(l => String(l.id) === String(selectedId)) || leads[0] || DEFAULT_LEADS[0];

  const handleSelectLead = (id: string) => {
    setSelectedId(id);
    setShowMobileChat(true);
  };

  return (
    <div className="flex flex-col h-full bg-canvas relative overflow-hidden">
      {/* Top Banner */}
      <div className="px-4 py-2 bg-accent/8 border-b border-accent/20 flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2 text-xs text-accent">
          <AlertCircle size={14} className="shrink-0" />
          <span className="truncate">
            <strong>Deterministic Gateway Active:</strong> &lt;1.4s SLA Auto-Reply & 0-100 Intent Scoring online
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowSimModal(true)}
          className="h-7 text-xs font-semibold px-2.5 shrink-0 gap-1.5"
        >
          <Zap size={12} className="fill-current" />
          <span>Simulate Lead</span>
        </Button>
      </div>

      {/* Main 3-Pane Responsive Layout */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Left Column: Lead List (Desktop always visible, Mobile conditionally hidden) */}
        <div className={`h-full ${showMobileChat ? 'hidden md:flex' : 'flex w-full md:w-80 shrink-0'}`}>
          <LeadList
            leads={leads}
            selected={selectedId}
            onSelect={handleSelectLead}
            filter={filter}
            setFilter={setFilter}
            onOpenSim={() => setShowSimModal(true)}
            className="w-full"
          />
        </div>

        {/* Center Column: Chat Canvas */}
        <div className={`h-full flex-1 min-w-0 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <ChatPanel
            lead={selectedLead}
            onBack={() => setShowMobileChat(false)}
            showIntelToggle={true}
            onToggleIntel={() => setShowIntelDrawer(!showIntelDrawer)}
          />
        </div>

        {/* Right Column: Lead Intel Panel (Desktop >= 1200px inline) */}
        <div className="hidden xl:flex w-80 shrink-0 h-full border-l border-border">
          <IntelPanel lead={selectedLead} />
        </div>

        {/* Tablet / Mobile Slide-Over Drawer for Intel Panel */}
        {showIntelDrawer && (
          <div className="xl:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm h-full bg-surface-sub border-l border-border relative flex flex-col shadow-2xl">
              <div className="p-3 border-b border-border flex items-center justify-between bg-surface-card">
                <span className="font-mono text-xs font-semibold text-primary">LEAD INTELLIGENCE</span>
                <button
                  onClick={() => setShowIntelDrawer(false)}
                  className="p-1 rounded text-tertiary hover:text-primary hover:bg-surface-hover"
                  aria-label="Close intel panel"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <IntelPanel lead={selectedLead} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Modal */}
      <SimulatorModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        onCreated={loadLeads}
      />
    </div>
  );
}
