import { useEffect, useRef, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  ArrowLeft, ListTodo, Map, Trash2, Send, Plus
} from 'lucide-react';
import { teamService, Team, Workspace } from '../services/teamService';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

interface Props {
  teamId: string;
  onBack: () => void;
  initialTab?: TabId;
}

type TabId = 'tasks' | 'roadmap';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
];

export function TeamWorkspace({ teamId, onBack, initialTab }: Props) {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [ws, setWs] = useState<Workspace | null>(null);
  const [tab, setTab] = useState<TabId>(initialTab || 'tasks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.id) socketService.connect(user.id);
        socketService.joinTeam(teamId);
        const [tdata, wdata] = await Promise.all([
          teamService.getById(teamId),
          teamService.getWorkspace(teamId),
        ]);
        if (!mounted) return;
        setTeam(tdata);
        setWs(wdata);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      socketService.leaveTeam(teamId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  if (loading) return <p className="text-center py-10 text-gray-500">Loading workspace…</p>;
  if (!team || !ws) return <p className="text-center py-10 text-gray-500">Workspace unavailable.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-600">{team.purpose}</p>
          </div>
        </div>
        {team.expiresAt && (
          <span className="text-xs px-3 py-1 bg-amber-50 text-amber-800 rounded-full">
            Expires {new Date(team.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'tasks' && <TeamTasks teamId={teamId} ws={ws} setWs={setWs} />}
      {tab === 'roadmap' && <TeamRoadmap teamId={teamId} ws={ws} setWs={setWs} />}
    </div>
  );
}

// ============= TASKS =============
function TeamTasks({ teamId, ws, setWs }: { teamId: string; ws: Workspace; setWs: (w: Workspace) => void }) {
  const [title, setTitle] = useState('');
  const columns: { id: 'todo' | 'in_progress' | 'done'; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-50 border-gray-200' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'done', label: 'Done', color: 'bg-green-50 border-green-200' },
  ];

  const add = async () => {
    if (!title.trim()) return;
    const t = await teamService.addTask(teamId, { title: title.trim(), status: 'todo' });
    setWs({ ...ws, tasks: [...ws.tasks, t] });
    setTitle('');
  };

  const updateStatus = async (taskId: string, status: any) => {
    const updated = await teamService.updateTask(teamId, taskId, { status });
    setWs({ ...ws, tasks: ws.tasks.map((t) => (t._id === taskId ? updated : t)) });
  };

  const remove = async (taskId: string) => {
    await teamService.deleteTask(teamId, taskId);
    setWs({ ...ws, tasks: ws.tasks.filter((t) => t._id !== taskId) });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="New task…" />
          <Button onClick={add} className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add</Button>
        </div>
      </Card>
      <div className="grid md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const items = ws.tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className={`border rounded-lg p-3 min-h-[200px] ${col.color}`}>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                {col.label} <span className="text-xs text-gray-500">{items.length}</span>
              </h3>
              <div className="space-y-2">
                {items.map((t) => (
                  <div key={t._id} className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-900">{t.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <select value={t.status} onChange={(e) => updateStatus(t._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5">
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button onClick={() => remove(t._id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No items</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============= ROADMAP =============
function TeamRoadmap({ teamId, ws, setWs }: { teamId: string; ws: Workspace; setWs: (w: Workspace) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const stages: { id: 'planned' | 'in_progress' | 'completed'; label: string; color: string }[] = [
    { id: 'planned', label: 'Planned', color: 'border-gray-300 bg-gray-50' },
    { id: 'in_progress', label: 'In Progress', color: 'border-blue-300 bg-blue-50' },
    { id: 'completed', label: 'Completed', color: 'border-green-300 bg-green-50' },
  ];

  const add = async () => {
    if (!title.trim()) return;
    const r = await teamService.addRoadmap(teamId, { title: title.trim(), description: description.trim(), stage: 'planned' });
    setWs({ ...ws, roadmap: [...ws.roadmap, r] });
    setTitle('');
    setDescription('');
  };

  const moveStage = async (id: string, stage: any) => {
    const r = await teamService.updateRoadmap(teamId, id, { stage });
    setWs({ ...ws, roadmap: ws.roadmap.map((x) => (x._id === id ? r : x)) });
  };

  const remove = async (id: string) => {
    await teamService.deleteRoadmap(teamId, id);
    setWs({ ...ws, roadmap: ws.roadmap.filter((x) => x._id !== id) });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Roadmap item title" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
          <Button onClick={add} className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add to Roadmap</Button>
        </div>
      </Card>
      <div className="grid md:grid-cols-3 gap-4">
        {stages.map((s) => {
          const items = ws.roadmap.filter((r) => r.stage === s.id);
          return (
            <div key={s.id} className={`border-2 rounded-lg p-3 min-h-[200px] ${s.color}`}>
              <h3 className="font-semibold text-gray-900 mb-3">{s.label} <span className="text-xs text-gray-500">({items.length})</span></h3>
              <div className="space-y-2">
                {items.map((r) => (
                  <div key={r._id} className="bg-white p-3 rounded shadow-sm">
                    <p className="font-medium text-sm text-gray-900">{r.title}</p>
                    {r.description && <p className="text-xs text-gray-600 mt-1">{r.description}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <select value={r.stage} onChange={(e) => moveStage(r._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5">
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button onClick={() => remove(r._id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No items</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}