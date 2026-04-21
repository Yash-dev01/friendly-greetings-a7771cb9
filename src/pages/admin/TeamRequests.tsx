import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Users, Clock, CheckCircle2, XCircle, Mail, Shield } from 'lucide-react';
import { teamService, Team } from '../../services/teamService';
import { motion } from 'framer-motion';

export function TeamRequests() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [approveTarget, setApproveTarget] = useState<Team | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Team | null>(null);
  const [duration, setDuration] = useState(14);
  const [reason, setReason] = useState('');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await teamService.allRequests(filter === 'all' ? undefined : filter);
      setTeams(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    if (!approveTarget) return;
    try {
      await teamService.approve(approveTarget._id, duration);
      setApproveTarget(null);
      setDuration(14);
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to approve');
    }
  };

  const reject = async () => {
    if (!rejectTarget) return;
    try {
      await teamService.reject(rejectTarget._id, reason);
      setRejectTarget(null);
      setReason('');
      await load();
    } catch (e: any) {
      alert(e.message || 'Failed to reject');
    }
  };

  const requesterName = (t: Team) => typeof t.requestedBy === 'string' ? '—' : t.requestedBy?.fullName;
  const requesterEmail = (t: Team) => typeof t.requestedBy === 'string' ? '' : t.requestedBy?.email;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Creation Requests</h1>
        <p className="text-gray-600 mt-1">Review alumni-submitted requests and grant temporary team access.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading requests…</p>
      ) : teams.length === 0 ? (
        <Card><div className="text-center py-10 text-gray-500"><Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />No requests in this category.</div></Card>
      ) : (
        <div className="grid gap-4">
          {teams.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        t.status === 'approved' ? 'bg-green-100 text-green-800' :
                        t.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>{t.status}</span>
                    </div>
                    {t.purpose && <p className="text-sm text-gray-600 mb-2">{t.purpose}</p>}
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Requested by:</span> {requesterName(t)} <span className="text-gray-500">{requesterEmail(t)}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(t.createdAt).toLocaleString()}</p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.permissions.map((p) => (
                        <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" /> {p.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Mail className="w-4 h-4" /> Members ({t.members.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {t.members.map((m, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">{m.email}</span>
                        ))}
                      </div>
                    </div>

                    {t.status === 'approved' && t.expiresAt && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                        <Clock className="w-4 h-4" /> Active for {t.durationDays} days · expires {new Date(t.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                    {t.status === 'rejected' && t.rejectionReason && (
                      <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">Reason: {t.rejectionReason}</p>
                    )}
                  </div>

                  {t.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => { setApproveTarget(t); setDuration(14); }} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                      <Button onClick={() => setRejectTarget(t)} variant="outline" className="text-red-600 border-red-300 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={!!approveTarget} onClose={() => setApproveTarget(null)} title="Approve Team Request">
        <div className="space-y-4">
          <p className="text-gray-700">Grant <strong>{approveTarget?.name}</strong> temporary team access. Each student will receive login credentials by email.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access duration (10–30 days)</label>
            <Input type="number" min={10} max={30} value={duration}
              onChange={(e) => setDuration(Math.max(10, Math.min(30, Number(e.target.value) || 14)))} />
            <p className="text-xs text-gray-500 mt-1">After this period, accounts revert to their original role.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={approve} className="flex-1 bg-green-600 hover:bg-green-700 text-white">Confirm Approval</Button>
            <Button onClick={() => setApproveTarget(null)} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Team Request">
        <div className="space-y-4">
          <p className="text-gray-700">Provide a reason (optional, sent to alumni):</p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" placeholder="Reason…" />
          <div className="flex gap-2">
            <Button onClick={reject} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Reject</Button>
            <Button onClick={() => setRejectTarget(null)} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
