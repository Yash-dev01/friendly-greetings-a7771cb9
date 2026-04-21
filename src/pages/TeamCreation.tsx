import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Users, X, Clock, CheckCircle2, XCircle, ArrowRight, Mail } from 'lucide-react';
import { teamService, Team } from '../services/teamService';
import { motion } from 'framer-motion';

const PERMISSION_OPTIONS = [
  { id: 'manage_events', label: 'Manage Events' },
  { id: 'event_participation', label: 'Event Participation' },
  { id: 'moderate_posts', label: 'Moderate Posts' },
  { id: 'manage_mentorship', label: 'Manage Mentorship' },
  { id: 'verify_data', label: 'Verify Data' },
  { id: 'manage_gallery', label: 'Manage Gallery' },
  { id: 'whiteboard', label: 'Whiteboard' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'pipelining', label: 'Pipelining' },
];

interface TeamCreationProps {
  onOpenWorkspace?: (teamId: string) => void;
}

export function TeamCreation({ onOpenWorkspace }: TeamCreationProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([
    'manage_events', 'moderate_posts', 'manage_mentorship', 'verify_data', 'whiteboard', 'roadmap', 'pipelining'
  ]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await teamService.myRequests();
      setTeams(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => {
    const e = emailInput.trim().toLowerCase();
    if (!e) return;
    if (!/^\S+@\S+\.\S+$/.test(e)) {
      alert('Invalid email address');
      return;
    }
    if (emails.includes(e)) return;
    setEmails([...emails, e]);
    setEmailInput('');
  };

  const togglePerm = (id: string) => {
    setPermissions(permissions.includes(id) ? permissions.filter((p) => p !== id) : [...permissions, id]);
  };

  const submit = async () => {
    if (!name.trim() || emails.length === 0) {
      alert('Please provide team name and at least one student email');
      return;
    }
    try {
      setSubmitting(true);
      await teamService.createRequest({ name: name.trim(), purpose: purpose.trim(), memberEmails: emails, permissions });
      setOpen(false);
      setName(''); setPurpose(''); setEmails([]); setEmailInput('');
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s: Team['status']) => {
    const map = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'Pending review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      expired: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Expired' },
    } as const;
    const cfg = map[s];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        <Icon className="w-3.5 h-3.5" /> {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Creation</h1>
          <p className="text-gray-600 mt-1">Request a temporary team of students to assist with platform operations.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Request Team
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading your team requests…</p>
      ) : teams.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No team requests yet</p>
            <p className="text-gray-500 text-sm mt-1">Click "Request Team" to invite students and submit to admin.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>
                    {t.purpose && <p className="text-sm text-gray-600 mt-1">{t.purpose}</p>}
                  </div>
                  {statusBadge(t.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" /> {t.members.length} member{t.members.length !== 1 ? 's' : ''}
                  </div>
                  {t.status === 'approved' && t.expiresAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" /> Expires {new Date(t.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                  {t.status === 'rejected' && t.rejectionReason && (
                    <p className="text-red-600 text-sm bg-red-50 p-2 rounded">Reason: {t.rejectionReason}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {t.permissions.slice(0, 4).map((p) => (
                    <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.replace(/_/g, ' ')}</span>
                  ))}
                  {t.permissions.length > 4 && <span className="px-2 py-0.5 text-xs text-gray-500">+{t.permissions.length - 4} more</span>}
                </div>

                {t.status === 'approved' && onOpenWorkspace && (
                  <Button onClick={() => onOpenWorkspace(t._id)} variant="outline" size="sm" className="mt-4 w-full flex items-center justify-center gap-2">
                    Open Workspace <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Request a New Team">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Event Moderators 2025" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              placeholder="What will this team help with?" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Emails *</label>
            <div className="flex gap-2">
              <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                placeholder="student@example.com" />
              <Button type="button" onClick={addEmail} variant="outline">Add</Button>
            </div>
            {emails.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {emails.map((e) => (
                  <span key={e} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-sm">
                    <Mail className="w-3 h-3 text-gray-500" />
                    {e}
                    <button onClick={() => setEmails(emails.filter((x) => x !== e))}>
                      <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Requested Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_OPTIONS.map((p) => (
                <label key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                  permissions.includes(p.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input type="checkbox" checked={permissions.includes(p.id)} onChange={() => togglePerm(p.id)} />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-800">
            ℹ️ Admin will review and grant access for 10–30 days. Each student will receive temporary login credentials by email.
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={submitting} className="flex-1">
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
            <Button onClick={() => setOpen(false)} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
