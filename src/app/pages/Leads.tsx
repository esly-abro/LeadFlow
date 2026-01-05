import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Plus, Upload, Filter, Search, Phone, Mail, Calendar,
  MoreHorizontal, Layout, LayoutList, Table as TableIcon, Headphones, X, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { createLead } from '../../services/leads';
import { Label } from '../components/ui/label';
import ImportLeadsDialog from '../components/ImportLeadsDialog';
import * as XLSX from 'xlsx';

export default function Leads() {
  const { leads, loading, error, refreshLeads } = useData();
  const [view, setView] = useState<'list' | 'kanban' | 'table'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website'
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExportLeads = async () => {
    try {
      setExporting(true);
      
      // Prepare data for Excel
      const exportData = leads.map(lead => ({
        'Name': lead.name,
        'Email': lead.email,
        'Phone': lead.phone,
        'Company': lead.company,
        'Source': lead.source,
        'Status': lead.status,
        'Created At': lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '',
        'Last Action': lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : ''
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');

      // Auto-size columns
      const colWidths = [
        { wch: 25 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 20 }, // Company
        { wch: 15 }, // Source
        { wch: 12 }, // Status
        { wch: 15 }, // Created At
        { wch: 15 }  // Last Action
      ];
      ws['!cols'] = colWidths;

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `zoho_leads_export_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      alert(`Successfully exported ${leads.length} leads!`);
    } catch (err) {
      console.error('Failed to export leads:', err);
      alert('Failed to export leads. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await createLead(formData);

      // Reset form and close dialog
      setFormData({ name: '', email: '', phone: '', company: '', source: 'Website' });
      setShowAddDialog(false);

      // Refresh leads to show the new one
      await refreshLeads();

      alert('Lead created successfully! It will appear in Zoho CRM.');
    } catch (err: any) {
      console.error('Failed to create lead:', err);
      alert(err.response?.data?.error || 'Failed to create lead. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load leads</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage and track all your leads in one place</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportLeads} disabled={exporting || leads.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Call Attended">Call Attended</SelectItem>
                <SelectItem value="No Response">No Response</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Site Visit Booked">Site Visit Booked</SelectItem>
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="LinkedIn Ads">LinkedIn Ads</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Google Ads">Google Ads</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'kanban' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('kanban')}
            >
              <Layout className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('table')}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>

      {/* Leads Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Action</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{lead.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.source}</td>
                  <td className="px-6 py-4">
                    <Badge
                      className={`
                        ${lead.status === 'WhatsApp Sent' || lead.status === 'Contacted' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                        ${lead.status === 'No Response' || lead.status === 'New' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                        ${lead.status === 'IVR Attempted' || lead.status === 'Proposal Sent' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : ''}
                        ${lead.status === 'Human Call Scheduled' || lead.status === 'Qualified' || lead.status === 'Negotiation' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      `}
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.lastActivity}</td>
                  <td className="px-6 py-4">
                    <Link to={`/leads/${lead.id}`}>
                      <Button variant="outline" size="sm" className="rounded-md border-blue-300 text-blue-600 hover:bg-blue-50">
                        Call Agent
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Lead Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
              <button
                onClick={() => setShowAddDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Inc"
                />
              </div>

              <div>
                <Label htmlFor="source">Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="LinkedIn Ads">LinkedIn Ads</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Lead'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Leads Dialog */}
      <ImportLeadsDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={refreshLeads}
      />
    </div>
  );
}
