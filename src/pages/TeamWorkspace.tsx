import { useEffect, useRef, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  ArrowLeft, MessageSquare, ListTodo, StickyNote, Map, Activity,
  Pencil, Trash2, Send, Plus, Eraser
} from 'lucide-react';
import { teamService, Team, Workspace, WhiteboardStroke } from '../services/teamService';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

interface Props {
  teamId: string;
  onBack: () => void;
}

type TabId = 'chat' | 'whiteboard' | 'tasks' | 'notes' | 'roadmap' | 'activity';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'chat', label: 'Team Chat', icon: MessageSquare },
  { id: 'whiteboard', label: 'Whiteboard', icon: Pencil },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export function TeamWorkspace({ teamId, onBack }: Props) {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [ws, setWs] = useState<Workspace | null>(null);
  const [tab, setTab] = useState<TabId>('chat');
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
      socketService.offTeamMessage();
      socketService.offWhiteboardStroke();
      socketService.offWhiteboardClear();
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

      {tab === 'chat' && <TeamChat teamId={teamId} ws={ws} setWs={setWs} />}
      {tab === 'whiteboard' && <TeamWhiteboard teamId={teamId} ws={ws} setWs={setWs} />}
      {tab === 'tasks' && <TeamTasks teamId={teamId} ws={ws} setWs={setWs} />}
      {tab === 'notes' && <TeamNotes teamId={teamId} ws={ws} setWs={setWs} />}
      {tab === 'roadmap' && <TeamRoadmap teamId={teamId} ws={ws} setWs={setWs} />}
      {tab === 'activity' && <TeamActivity ws={ws} />}
    </div>
  );
}

// ============= CHAT =============
function TeamChat({ teamId, ws, setWs }: { teamId: string; ws: Workspace; setWs: (w: Workspace) => void }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketService.onTeamMessage((data: any) => {
      if (data.teamId !== teamId) return;
      setWs({ ...ws, messages: [...ws.messages, data.message] });
    });
    return () => { socketService.offTeamMessage(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, ws]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ws.messages.length]);

  const send = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    try {
      const msg = await teamService.sendMessage(teamId, content);
      setWs({ ...ws, messages: [...ws.messages, msg] });
      socketService.sendTeamMessage({ teamId, message: msg });
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Card>
      <div className="h-[480px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 p-2">
          {ws.messages.length === 0 && <p className="text-center text-gray-400 py-10">No messages yet. Say hi 👋</p>}
          {ws.messages.map((m) => {
            const sid = typeof m.senderId === 'string' ? m.senderId : m.senderId?._id;
            const mine = sid === user?.id;
            const name = typeof m.senderId === 'object' ? m.senderId?.fullName : 'User';
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {!mine && <p className="text-xs font-medium mb-0.5 opacity-80">{name}</p>}
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2 pt-3 border-t">
          <Input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), send())}
            placeholder="Type a message…" />
          <Button onClick={send} className="flex items-center gap-1"><Send className="w-4 h-4" /> Send</Button>
        </div>
      </div>
    </Card>
  );
}

// ============= WHITEBOARD =============
function TeamWhiteboard({ teamId, ws, setWs }: { teamId: string; ws: Workspace; setWs: (w: Workspace) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const currentStroke = useRef<{ color: string; width: number; points: number[][] } | null>(null);
  const [color, setColor] = useState('#1d3557');
  const [width, setWidth] = useState(3);

  const drawStroke = (s: WhiteboardStroke) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !s.points?.length) return;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    s.points.forEach((p, i) => {
      const [x, y] = p;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const redrawAll = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ws.whiteboard.forEach(drawStroke);
  };

  useEffect(() => { redrawAll(); /* eslint-disable-next-line */ }, [ws.whiteboard.length]);

  useEffect(() => {
    socketService.onWhiteboardStroke((data: any) => {
      if (data.teamId !== teamId) return;
      setWs({ ...ws, whiteboard: [...ws.whiteboard, data.stroke] });
      drawStroke(data.stroke);
    });
    socketService.onWhiteboardClear((data: any) => {
      if (data.teamId !== teamId) return;
      setWs({ ...ws, whiteboard: [] });
    });
    return () => {
      socketService.offWhiteboardStroke();
      socketService.offWhiteboardClear();
    };
    // eslint-disable-next-line
  }, [teamId, ws]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    currentStroke.current = { color, width, points: [getPos(e)] };
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || !currentStroke.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    const pts = currentStroke.current.points;
    pts.push(pos);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2][0], pts[pts.length - 2][1]);
    ctx.lineTo(pos[0], pos[1]);
    ctx.stroke();
  };

  const end = async () => {
    if (!drawing.current || !currentStroke.current) return;
    drawing.current = false;
    const stroke = currentStroke.current;
    currentStroke.current = null;
    if (stroke.points.length < 2) return;
    try {
      const saved = await teamService.addStroke(teamId, stroke);
      setWs({ ...ws, whiteboard: [...ws.whiteboard, saved] });
      socketService.emitWhiteboardStroke({ teamId, stroke: saved });
    } catch (e) { console.error(e); }
  };

  const clearAll = async () => {
    if (!confirm('Clear the whiteboard for everyone?')) return;
    await teamService.clearWhiteboard(teamId);
    setWs({ ...ws, whiteboard: [] });
    socketService.emitWhiteboardClear({ teamId });
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <label className="flex items-center gap-1 text-sm">Color
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
        </label>
        <label className="flex items-center gap-1 text-sm">Width
          <input type="range" min={1} max={12} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          <span className="text-xs w-6 text-gray-600">{width}px</span>
        </label>
        <Button variant="outline" size="sm" onClick={clearAll} className="ml-auto flex items-center gap-1 text-red-600 border-red-300">
          <Eraser className="w-4 h-4" /> Clear
        </Button>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">Real-time collaborative whiteboard. Drawings are persisted and synced to all team members.</p>
    </Card>
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

// ============= NOTES =============
function TeamNotes({ teamId, ws, setWs }: { teamId: string; ws: Workspace; setWs: (w: Workspace) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const add = async () => {
    if (!content.trim()) return;
    const n = await teamService.addNote(teamId, { title: title.trim(), content: content.trim() });
    setWs({ ...ws, notes: [...ws.notes, n] });
    setTitle(''); setContent('');
  };

  const remove = async (id: string) => {
    await teamService.deleteNote(teamId, id);
    setWs({ ...ws, notes: ws.notes.filter((n) => n._id !== id) });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title (optional)" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" placeholder="Note content…" />
          <Button onClick={add} className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add Note</Button>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-3">
        {ws.notes.map((n) => (
          <Card key={n._id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {n.title && <h4 className="font-semibold text-gray-900 mb-1">{n.title}</h4>}
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {n.authorId?.fullName} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => remove(n._id)} className="text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {ws.notes.length === 0 && <p className="text-gray-500 col-span-full text-center py-6">No notes yet.</p>}
      </div>
    </div>
  );
}

// ============= ROADMAP / PIPELINE =============
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
    setTitle(''); setDescription('');
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

// ============= ACTIVITY LOG =============
function TeamActivity({ ws }: { ws: Workspace }) {
  const items = [...ws.activity].reverse();
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
      <div className="space-y-2 max-h-[480px] overflow-y-auto">
        {items.length === 0 && <p className="text-gray-500 text-center py-6">No activity yet.</p>}
        {items.map((a) => (
          <div key={a._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
              {(a.userId?.fullName || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{a.userId?.fullName || 'Someone'}</span>{' '}
                <span className="text-gray-600">{a.action.replace(/_/g, ' ')}</span>
                {a.meta?.title && <span className="text-gray-500"> — "{a.meta.title}"</span>}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
