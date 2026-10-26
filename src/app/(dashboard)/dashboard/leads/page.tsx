"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Upload,
  Download,
  Search,
  PhoneCall,
  Mail,
  Building2,
  Trash2,
  LayoutGrid,
  List,
  CheckCircle2,
  UserCheck,
  DollarSign,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Check,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";
import { INITIAL_LEADS, type Lead } from "@/lib/demo-data";

const STATUS_COLUMNS = [
  { id: "New", title: "New Contacts", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200" },
  { id: "In Progress", title: "Calling In Progress", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200" },
  { id: "Qualified", title: "Interested Customers", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200" },
  { id: "Meeting Booked", title: "Appointments Booked", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200" },
  { id: "Disqualified", title: "Not Interested", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200" },
] as const;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table");
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");

  // Selection for bulk actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [importCsvModalOpen, setImportCsvModalOpen] = useState(false);
  const [leadDetailModal, setLeadDetailModal] = useState<Lead | null>(null);

  // New Lead Form
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    dealSize: "₹15,00,000",
    assignedAgent: "Ananya Rao (అనన్య)",
    status: "New" as Lead["status"],
  });

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    name: "name",
    email: "email",
    phone: "phone",
    company: "company",
    dealSize: "dealSize",
  });
  const [importStats, setImportStats] = useState<{ imported: number; duplicates: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch leads on mount
  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setLeads(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching leads:", err));
  }, []);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);

      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  // Single Lead Create
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) return;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLead.name,
          company: newLead.company || "Independent",
          email: newLead.email,
          phone: newLead.phone || "+1 (555) 000-0000",
          dealSize: newLead.dealSize,
          assignedAgent: newLead.assignedAgent,
          status: newLead.status,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLeads((prev) => [data.data, ...prev]);
      } else {
        const fallback: Lead = {
          id: `lead-${Date.now()}`,
          name: newLead.name,
          company: newLead.company || "Independent",
          email: newLead.email,
          phone: newLead.phone || "+1 (555) 000-0000",
          status: newLead.status,
          assignedAgent: newLead.assignedAgent,
          lastContact: "Just now",
          dealSize: newLead.dealSize,
        };
        setLeads((prev) => [fallback, ...prev]);
      }
    } catch {
      const fallback: Lead = {
        id: `lead-${Date.now()}`,
        name: newLead.name,
        company: newLead.company || "Independent",
        email: newLead.email,
        phone: newLead.phone || "+1 (555) 000-0000",
        status: newLead.status,
        assignedAgent: newLead.assignedAgent,
        lastContact: "Just now",
        dealSize: newLead.dealSize,
      };
      setLeads((prev) => [fallback, ...prev]);
    }

    setNewLead({
      name: "",
      company: "",
      email: "",
      phone: "",
      dealSize: "$25,000/yr",
      assignedAgent: "Jordan Blake",
      status: "New",
    });
    setAddLeadModalOpen(false);
  };

  // Status transition update
  const handleUpdateStatus = async (leadId: string, newStatus: Lead["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, lastContact: "Updated just now" } : l))
    );

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
    if (leadDetailModal?.id === leadId) setLeadDetailModal(null);

    try {
      await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete lead error:", err);
    }
  };

  // CSV File Handler
  const handleCsvFileUpload = (file: File) => {
    setCsvFile(file);
    setImportStats(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      setCsvHeaders(headers);

      // Auto-match headers
      const autoMap = {
        name: headers.find((h) => /name|full/i.test(h)) || headers[0] || "",
        email: headers.find((h) => /email|mail/i.test(h)) || headers[1] || "",
        phone: headers.find((h) => /phone|mobile|tel/i.test(h)) || headers[2] || "",
        company: headers.find((h) => /company|org|business/i.test(h)) || headers[3] || "",
        dealSize: headers.find((h) => /deal|value|budget|size/i.test(h)) || headers[4] || "",
      };
      setColumnMapping(autoMap);

      const parsed = lines.slice(1, 11).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const rowObj: Record<string, string> = {};
        headers.forEach((h, i) => {
          rowObj[h] = values[i] || "";
        });
        return rowObj;
      });
      setParsedRows(parsed);
    };
    reader.readAsText(file);
  };

  // Commit CSV Import
  const handleCommitCsvImport = async () => {
    if (!csvFile) return;
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

      const nameIdx = headers.indexOf(columnMapping.name);
      const emailIdx = headers.indexOf(columnMapping.email);
      const phoneIdx = headers.indexOf(columnMapping.phone);
      const compIdx = headers.indexOf(columnMapping.company);
      const dealIdx = headers.indexOf(columnMapping.dealSize);

      const batchToUpload = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        return {
          name: vals[nameIdx] || "Prospect Lead",
          email: vals[emailIdx] || `lead-${Date.now()}@domain.com`,
          phone: vals[phoneIdx] || "+1 (555) 019-2000",
          company: vals[compIdx] || "Enterprise",
          dealSize: vals[dealIdx] || "$20,000/yr",
          status: "NEW",
          assignedAgent: "Jordan Blake",
        };
      });

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batchToUpload),
        });
        const resJson = await res.json();

        if (resJson.success && resJson.data) {
          const { importedCount, duplicatesCount, leads: newItems } = resJson.data;
          setImportStats({ imported: importedCount, duplicates: duplicatesCount });
          if (newItems && Array.isArray(newItems)) {
            setLeads((prev) => [...newItems, ...prev]);
          }
        }
      } catch (err) {
        console.error("CSV import error:", err);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const csvHeader = ["Name", "Company", "Email", "Phone", "Status", "Assigned Agent", "Deal Size", "Last Contact"];
    const csvRows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.company}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.status}"`,
      `"${l.assignedAgent}"`,
      `"${l.dealSize}"`,
      `"${l.lastContact}"`,
    ]);

    const csvContent = [csvHeader.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sidemate-leads-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Sandbox Call Trigger
  const handleTriggerSandboxCall = async (lead: Lead) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName: lead.name,
          company: lead.company,
          phone: lead.phone,
          agentName: lead.assignedAgent || "Jordan Blake",
          mode: "sandbox",
        }),
      });

      handleUpdateStatus(lead.id, "In Progress");
      alert(`📞 Test phone call started for ${lead.name} with ${lead.assignedAgent}. Call recording and notes saved.`);
    } catch (err) {
      console.error("Call trigger error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customer Contacts & Leads
            </h1>
            <Badge variant="default" size="sm">
              {leads.length} Total Contacts
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Manage your customer phone numbers, import Excel/CSV files, assign AI voice agents, and track interested buyers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-md border bg-muted/40 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                viewMode === "table" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                viewMode === "pipeline" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Pipeline Kanban View"
            >
              <LayoutGrid className="h-4 w-4" />
              Pipeline
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 shadow-xs"
            title="Download CSV export"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setImportCsvModalOpen(true);
              setCsvFile(null);
              setImportStats(null);
            }}
            className="gap-1.5 shadow-xs"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setAddLeadModalOpen(true)}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, email, company, or phone..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Status:</span>
          {["All", "New", "In Progress", "Qualified", "Meeting Booked", "Disqualified"].map((st) => {
            const count = st === "All" ? leads.length : leads.filter((l) => l.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {st} <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedLeadIds.length > 0 && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-medium text-indigo-900 dark:text-indigo-200">
            {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                selectedLeadIds.forEach((id) => handleUpdateStatus(id, "Qualified"));
                setSelectedLeadIds([]);
              }}
              className="h-7 text-xs"
            >
              Mark Qualified
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                selectedLeadIds.forEach((id) => handleDeleteLead(id));
                setSelectedLeadIds([]);
              }}
              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Delete Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedLeadIds([])}
              className="h-7 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: TABLE VIEW */}
      {/* ===================================================================== */}
      {viewMode === "table" && (
        <Card className="shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLeadIds(filteredLeads.map((l) => l.id));
                        else setSelectedLeadIds([]);
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Prospect</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Deal Size</th>
                  <th className="p-3">Assigned AI Agent</th>
                  <th className="p-3">Last Activity</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No leads match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-muted/30 transition-colors ${isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""}`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedLeadIds([...selectedLeadIds, lead.id]);
                              else setSelectedLeadIds(selectedLeadIds.filter((id) => id !== lead.id));
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => setLeadDetailModal(lead)}
                            className="font-medium text-foreground hover:text-indigo-600 transition-colors text-left"
                          >
                            {lead.name}
                          </button>
                          <div className="text-[11px] text-muted-foreground">{lead.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{lead.company}</div>
                          <div className="text-[11px] text-muted-foreground">{lead.phone}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                            className="text-xs rounded-md border bg-background px-2 py-1 focus:ring-1 focus:ring-indigo-600"
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Meeting Booked">Meeting Booked</option>
                            <option value="Disqualified">Disqualified</option>
                          </select>
                        </td>
                        <td className="p-3 font-semibold text-foreground">{lead.dealSize}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              AI
                            </span>
                            {lead.assignedAgent}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{lead.lastContact}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTriggerSandboxCall(lead)}
                              className="h-7 text-xs gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              title="Initiate Outbound Sandbox Dial"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                              Call
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: PIPELINE KANBAN VIEW */}
      {/* ===================================================================== */}
      {viewMode === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-3 bg-muted/20 border rounded-xl p-3 min-h-[500px]">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${col.id === "Qualified" ? "bg-emerald-500" : col.id === "Meeting Booked" ? "bg-purple-500" : col.id === "Disqualified" ? "bg-rose-500" : "bg-indigo-500"}`} />
                    {col.title}
                  </span>
                  <Badge variant="outline" className={`text-[10px] ${col.color}`}>
                    {colLeads.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {colLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="p-3 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer bg-card border-border"
                      onClick={() => setLeadDetailModal(lead)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-xs leading-tight">{lead.name}</div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {lead.dealSize}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{lead.company}</div>

                      <div className="mt-3 pt-2 border-t flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="truncate max-w-[100px]">{lead.assignedAgent}</span>
                        <div
                          className="text-indigo-600 hover:underline flex items-center gap-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerSandboxCall(lead);
                          }}
                        >
                          <PhoneCall className="h-2.5 w-2.5" />
                          Dial
                        </div>
                      </div>
                    </Card>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-muted-foreground">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD SINGLE LEAD */}
      {/* ===================================================================== */}
      <Modal
        open={addLeadModalOpen}
        onOpenChange={setAddLeadModalOpen}
        title="Add New Target Lead"
        description="Enter prospect contact details to enroll them into autonomous qualification outreach."
      >
        <form onSubmit={handleAddLead} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Full Name *</label>
              <Input
                required
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                placeholder="Devon Vance"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Company Name</label>
              <Input
                value={newLead.company}
                onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                placeholder="Starlight Ventures"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Work Email *</label>
              <Input
                type="email"
                required
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                placeholder="devon@starlight.io"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Phone Number</label>
              <Input
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                placeholder="+1 (555) 482-1920"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Estimated Deal Value</label>
              <Input
                value={newLead.dealSize}
                onChange={(e) => setNewLead({ ...newLead, dealSize: e.target.value })}
                placeholder="$25,000/yr"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Assigned Telugu Caller</label>
              <select
                value={newLead.assignedAgent}
                onChange={(e) => setNewLead({ ...newLead, assignedAgent: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs"
              >
                <option value="Ananya Rao">Ananya Rao (Real Estate & Appointments)</option>
                <option value="Suresh Kumar">Suresh Kumar (Wholesale & Trade)</option>
                <option value="Harika Varma">Harika Varma (Clinic Reception)</option>
                <option value="Venkat Prabhu">Venkat Prabhu (EMI & Payments)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Save & Enroll Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: CSV IMPORT WITH COLUMN MAPPING & DEDUPLICATION */}
      {/* ===================================================================== */}
      <Modal
        open={importCsvModalOpen}
        onOpenChange={setImportCsvModalOpen}
        title="Batch Import Leads via CSV"
        description="Upload a CSV spreadsheet with prospect contact information. Columns are mapped automatically."
      >
        <div className="space-y-4 text-xs">
          {!csvFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-muted/40 transition-colors border-indigo-200 dark:border-indigo-900"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvFileUpload(file);
                }}
              />
              <FileSpreadsheet className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
              <div className="font-medium text-sm">Click to select CSV or drag file here</div>
              <p className="text-muted-foreground mt-1 text-xs">
                Supports standard comma-separated (.csv) files up to 5,000 rows
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                  <div>
                    <div className="font-medium">{csvFile.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {(csvFile.size / 1024).toFixed(1)} KB • Detected {parsedRows.length}+ rows
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCsvFile(null);
                    setParsedRows([]);
                  }}
                  className="h-7 text-xs"
                >
                  Choose Different File
                </Button>
              </div>

              {/* Column Mapping Section */}
              <div className="space-y-2">
                <div className="font-semibold text-xs">Verify Column Mapping</div>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg">
                  <div>
                    <label className="text-[11px] text-muted-foreground">Full Name Column</label>
                    <select
                      value={columnMapping.name}
                      onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                      className="w-full rounded border bg-background px-2 py-1 text-xs mt-0.5"
                    >
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Email Address Column</label>
                    <select
                      value={columnMapping.email}
                      onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                      className="w-full rounded border bg-background px-2 py-1 text-xs mt-0.5"
                    >
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Phone Number Column</label>
                    <select
                      value={columnMapping.phone}
                      onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                      className="w-full rounded border bg-background px-2 py-1 text-xs mt-0.5"
                    >
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Company Name Column</label>
                    <select
                      value={columnMapping.company}
                      onChange={(e) => setColumnMapping({ ...columnMapping, company: e.target.value })}
                      className="w-full rounded border bg-background px-2 py-1 text-xs mt-0.5"
                    >
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview Rows Table */}
              <div className="space-y-1">
                <div className="font-semibold text-xs">Previewing First 5 Rows</div>
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-muted/70 border-b">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2">Company</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="p-2">{row[columnMapping.name]}</td>
                          <td className="p-2 text-muted-foreground">{row[columnMapping.email]}</td>
                          <td className="p-2">{row[columnMapping.phone]}</td>
                          <td className="p-2">{row[columnMapping.company]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Results Notification */}
              {importStats && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Successfully imported <strong>{importStats.imported}</strong> new leads.{" "}
                      {importStats.duplicates > 0 && (
                        <span>({importStats.duplicates} duplicates automatically skipped).</span>
                      )}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setImportCsvModalOpen(false)}
                    className="h-7 text-xs"
                  >
                    Done
                  </Button>
                </div>
              )}

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImportCsvModalOpen(false)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCommitCsvImport}
                  disabled={isImporting || importStats !== null}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isImporting ? "Importing Leads..." : "Import & Deduplicate"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: LEAD DETAIL DRAWER & TELEMETRY */}
      {/* ===================================================================== */}
      {leadDetailModal && (
        <Modal
          open={!!leadDetailModal}
          onOpenChange={(open) => !open && setLeadDetailModal(null)}
          title={`Lead Details: ${leadDetailModal.name}`}
          description="Detailed prospect profile, assigned voice employee, and conversation activity history."
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl border">
              <div>
                <span className="text-muted-foreground block text-[11px]">Company</span>
                <span className="font-semibold text-sm">{leadDetailModal.company}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Est. Deal Size</span>
                <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                  {leadDetailModal.dealSize}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Work Email</span>
                <span>{leadDetailModal.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Phone Number</span>
                <span>{leadDetailModal.phone}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Current Qualification Stage</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(["New", "In Progress", "Qualified", "Meeting Booked", "Disqualified"] as const).map(
                  (st) => {
                    const isActive = leadDetailModal.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          handleUpdateStatus(leadDetailModal.id, st);
                          setLeadDetailModal({ ...leadDetailModal, status: st });
                        }}
                        className={`p-2 rounded-lg border text-center text-[10px] font-medium transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-card hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  AI
                </span>
                <div>
                  <div className="font-medium">{leadDetailModal.assignedAgent}</div>
                  <div className="text-[11px] text-muted-foreground">Assigned AI Voice Agent</div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleTriggerSandboxCall(leadDetailModal)}
                className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Make Test Phone Call
              </Button>
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteLead(leadDetailModal.id)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete Prospect
              </Button>
              <Button size="sm" onClick={() => setLeadDetailModal(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
