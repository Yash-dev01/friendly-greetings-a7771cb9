import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { profileService, ProfileData } from '../services/profileService';
import { User, Mail, Phone, Building, Briefcase, MapPin, Globe, Linkedin, FileText, Save, Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '', email: '', phone: '', company: '', position: '',
    industry: '', experience: 0, skills: [], linkedinUrl: '',
    portfolioUrl: '', location: '', bio: '', avatarUrl: '', resumeUrl: '',
    department: '', graduationYear: undefined,
  });
  const [skillInput, setSkillInput] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: (data as any).phone || '',
        company: (data as any).company || '',
        position: (data as any).position || '',
        industry: (data as any).industry || '',
        experience: (data as any).experience || 0,
        skills: (data as any).skills || [],
        linkedinUrl: (data as any).linkedinUrl || '',
        portfolioUrl: (data as any).portfolioUrl || '',
        location: (data as any).location || '',
        bio: (data as any).bio || '',
        avatarUrl: (data as any).avatarUrl || '',
        resumeUrl: (data as any).resumeUrl || '',
        department: (data as any).department || '',
        graduationYear: (data as any).graduationYear,
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(profile);
      // Update localStorage user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsed, ...profile }));
      }
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await profileService.uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatarUrl: url }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload avatar');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await profileService.uploadResume(file);
      setProfile((prev) => ({ ...prev, resumeUrl: url }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload resume');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills?.includes(skillInput.trim())) {
      setProfile((prev) => ({ ...prev, skills: [...(prev.skills || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({ ...prev, skills: (prev.skills || []).filter((s) => s !== skill) }));
  };

  const getAvatarSrc = () => {
    if (!profile.avatarUrl) return null;
    if (profile.avatarUrl.startsWith('http')) return profile.avatarUrl;
    return `${API_BASE}${profile.avatarUrl}`;
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal and professional information</p>
      </div>

      {/* Avatar Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {getAvatarSrc() ? (
                  <img src={getAvatarSrc()!} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-gray-600">{profile.position} {profile.company ? `at ${profile.company}` : ''}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><User className="w-4 h-4 inline mr-1" />Full Name</label>
              <Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Mail className="w-4 h-4 inline mr-1" />Email</label>
              <Input value={profile.email} disabled className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Phone className="w-4 h-4 inline mr-1" />Phone</label>
              <Input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="w-4 h-4 inline mr-1" />Location</label>
              <Input value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        </Card>
      </motion.div>

      {/* Professional Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Building className="w-4 h-4 inline mr-1" />Company</label>
              <Input value={profile.company || ''} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Briefcase className="w-4 h-4 inline mr-1" />Job Title</label>
              <Input value={profile.position || ''} onChange={(e) => setProfile({ ...profile, position: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <Input value={profile.industry || ''} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} placeholder="e.g. Technology, Finance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <Input type="number" value={profile.experience || 0} onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.skills || []).map((skill) => (
              <span key={skill} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-2 text-blue-500 hover:text-blue-700"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Type a skill and press Enter"
              className="flex-1"
            />
            <Button onClick={addSkill} size="sm">Add</Button>
          </div>
        </Card>
      </motion.div>

      {/* Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Linkedin className="w-4 h-4 inline mr-1" />LinkedIn</label>
              <Input value={profile.linkedinUrl || ''} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Globe className="w-4 h-4 inline mr-1" />Portfolio</label>
              <Input value={profile.portfolioUrl || ''} onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })} placeholder="https://yourportfolio.com" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1"><FileText className="w-4 h-4 inline mr-1" />Resume</label>
            {profile.resumeUrl ? (
              <div className="flex items-center gap-2">
                <a href={profile.resumeUrl.startsWith('http') ? profile.resumeUrl : `${API_BASE}${profile.resumeUrl}`} target="_blank" className="text-blue-600 text-sm hover:underline">View Resume</a>
                <Button size="sm" variant="outline" onClick={() => resumeInputRef.current?.click()}>Replace</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => resumeInputRef.current?.click()}>Upload Resume</Button>
            )}
            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
          </div>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center space-x-2" size="lg">
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </Button>
      </motion.div>
    </div>
  );
}
