// import { useState } from 'react';
// import { Card } from '../../components/ui/Card';
// import { Input } from '../../components/ui/Input';
// import { Button } from '../../components/ui/Button';
// import { Modal } from '../../components/ui/Modal';
// import { Briefcase, Plus, Edit2, Trash2, X } from 'lucide-react';
// import { storage } from '../../lib/storage';
// import { motion } from 'framer-motion';

// interface JobForm {
//   company: string;
//   role: string;
//   location: string;
//   description: string;
//   requirements: string;
//   salaryRange?: string;
//   employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
// }

// export function JobsManagement() {
//   const [jobs, setJobs] = useState(storage.getJobs());
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [formData, setFormData] = useState<JobForm>({
//     company: '',
//     role: '',
//     location: '',
//     description: '',
//     requirements: '',
//     employmentType: 'full-time',
//   });

//   const filteredJobs = jobs.filter(job =>
//     job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     job.role.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleOpenModal = (job?: any) => {
//     if (job) {
//       setFormData({
//         company: job.company,
//         role: job.role,
//         location: job.location,
//         description: job.description,
//         requirements: job.requirements,
//         salaryRange: job.salaryRange,
//         employmentType: job.employmentType,
//       });
//       setEditingId(job.id);
//     } else {
//       setFormData({
//         company: '',
//         role: '',
//         location: '',
//         description: '',
//         requirements: '',
//         employmentType: 'full-time',
//       });
//       setEditingId(null);
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setEditingId(null);
//   };

//   const handleSubmit = () => {
//     if (!formData.company || !formData.role || !formData.location || !formData.description || !formData.requirements) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (editingId) {
//       const updatedJobs = jobs.map(job =>
//         job.id === editingId
//           ? { ...job, ...formData }
//           : job
//       );
//       setJobs(updatedJobs);
//       storage.saveJobs(updatedJobs);
//     } else {
//       const newJob = {
//         id: Date.now().toString(),
//         postedBy: 'admin',
//         ...formData,
//         isActive: true,
//         createdAt: new Date(),
//         applications: [],
//       };
//       const updatedJobs = [newJob, ...jobs];
//       setJobs(updatedJobs);
//       storage.saveJobs(updatedJobs);
//     }

//     handleCloseModal();
//   };

//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this job posting?')) {
//       const updatedJobs = jobs.filter(job => job.id !== id);
//       setJobs(updatedJobs);
//       storage.saveJobs(updatedJobs);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
//           <p className="text-gray-600 mt-1">Manage job opportunities</p>
//         </div>
//         <Button onClick={() => handleOpenModal()}>
//           <Plus className="w-4 h-4 mr-2" />
//           New Job
//         </Button>
//       </div>

//       <Card>
//         <div className="relative">
//           <Input
//             placeholder="Search jobs by company or role..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </Card>

//       <div className="grid gap-4">
//         {filteredJobs.map((job, index) => (
//           <motion.div
//             key={job.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.05 }}
//           >
//             <Card hover>
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-start space-x-4 flex-1">
//                   <div className="bg-blue-100 p-3 rounded-lg">
//                     <Briefcase className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-gray-900">{job.role}</h3>
//                     <p className="text-gray-600 mt-1">{job.company} • {job.location}</p>
//                     {job.salaryRange && (
//                       <p className="text-sm text-green-600 mt-1">{job.salaryRange}</p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     onClick={() => handleOpenModal(job)}
//                     className="bg-blue-50 text-blue-600 hover:bg-blue-100"
//                   >
//                     <Edit2 className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     onClick={() => handleDelete(job.id)}
//                     className="bg-red-50 text-red-600 hover:bg-red-100"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div>
//                   <h4 className="font-semibold text-gray-900 text-sm">Description</h4>
//                   <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-900 text-sm">Requirements</h4>
//                   <p className="text-gray-700 text-sm line-clamp-2">{job.requirements}</p>
//                 </div>
//               </div>

//               <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
//                 <span>{job.employmentType}</span>
//                 <span>{job.applications?.length || 0} applications</span>
//               </div>
//             </Card>
//           </motion.div>
//         ))}
//       </div>

//       {filteredJobs.length === 0 && (
//         <Card>
//           <div className="text-center py-12">
//             <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No job postings found</p>
//           </div>
//         </Card>
//       )}

//       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Job Posting' : 'Create New Job'}>
//         <div className="space-y-4 max-h-96 overflow-y-auto">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
//             <Input
//               value={formData.company}
//               onChange={(e) => setFormData({ ...formData, company: e.target.value })}
//               placeholder="Company name"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
//             <Input
//               value={formData.role}
//               onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//               placeholder="e.g., Senior Developer"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//             <Input
//               value={formData.location}
//               onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//               placeholder="e.g., New York, NY"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
//             <select
//               value={formData.employmentType}
//               onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="full-time">Full-time</option>
//               <option value="part-time">Part-time</option>
//               <option value="contract">Contract</option>
//               <option value="internship">Internship</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Optional)</label>
//             <Input
//               value={formData.salaryRange || ''}
//               onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
//               placeholder="e.g., $80,000 - $120,000"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               placeholder="Job description..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//               rows={3}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
//             <textarea
//               value={formData.requirements}
//               onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
//               placeholder="List job requirements..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//               rows={3}
//             />
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button onClick={handleSubmit} className="flex-1">
//               {editingId ? 'Update Job' : 'Create Job'}
//             </Button>
//             <Button onClick={handleCloseModal} variant="outline" className="flex-1">
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {jobManagementService } from '../../services/jobManagementService';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface JobForm {
  company: string;
  role: string;
  location: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  applyLink?: string;
}

export function JobsManagement() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<JobForm>({
    company: '',
    role: '', 
    location: '',
    description: '',
    requirements: '',
    employmentType: 'full-time',
  });

  // ========= Load All Jobs ========
  const fetchJobs = async () => {
    try {
      const res = await jobManagementService.getJobs();
      setJobs(res);
    } catch (err) {
      alert("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs() }, []);

  const filteredJobs = jobs.filter(job =>
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========= Open Modal =========
  const handleOpenModal = (job?: any) => {
    if (job) {
      setFormData({
        company: job.company,
        role: job.role,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        salaryRange: job.salaryRange,
        employmentType: job.employmentType,
        applyLink: job.applyLink,
      });
      setEditingId(job._id);
    } else {
      setFormData({
        company: '',
        role: '',
        location: '',
        description: '',
        requirements: '',
        employmentType: 'full-time',
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // ========= Submit Form (Create/Update) ========
  const handleSubmit = async () => {
    if (!formData.company || !formData.role || !formData.location || !formData.description || !formData.requirements) {
      alert('Fill all required fields');
      return;
    }

    try {
      if (editingId) {
        await jobManagementService.updateJob(editingId, formData);
      } else {
        await jobManagementService.createJob(formData);
      }
      fetchJobs();
      handleCloseModal();
    } catch (err) {
      alert("Operation Failed");
    }
  };

  // ========= Delete Job =========
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await jobManagementService.deleteJob(id);
      fetchJobs();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage job opportunities</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" /> New Job
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search jobs by company or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Loading */}
      {loading && <p className="text-center py-10 text-gray-500">Loading jobs...</p>}

      {/* Jobs List */}
      <div className="grid gap-4">
        {filteredJobs.map((job, i) => (
          <motion.div key={job._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
            <Card hover>
              <div className="flex justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{job.role}</h3>
                    <p className="text-gray-600">{job.company} • {job.location}</p>
                    {job.salaryRange && <p className="text-sm text-green-600">{job.salaryRange}</p>}
                    {job.applyLink && 
                      <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                        Apply Link
                      </a>
                    }
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleOpenModal(job)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-red-100 text-red-600" onClick={() => handleDelete(job._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No jobs */}
      {!loading && filteredJobs.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
            <p className="text-gray-500">No job postings found</p>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Job Posting':'Create Job'}>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">

          {['company','role','location'].map(field => (
            <Input 
              key={field}
              placeholder={field}
              value={(formData as any)[field]}
              onChange={e => setFormData({...formData,[field]:e.target.value})}
            />
          ))}

          <Input
            placeholder="Salary Range (optional)"
            value={formData.salaryRange || ''}
            onChange={(e)=>setFormData({...formData,salaryRange:e.target.value})}
          />

          <Input
            placeholder="Apply Link (optional)"
            value={formData.applyLink || ''}
            onChange={(e)=>setFormData({...formData,applyLink:e.target.value})}
          />

          <select
            value={formData.employmentType}
            onChange={(e)=>setFormData({...formData,employmentType: e.target.value as any})}
            className="w-full border p-2 rounded"
          >
            <option>full-time</option><option>part-time</option>
            <option>contract</option><option>internship</option>
          </select>

          <textarea
            rows={2} placeholder="Description"
            className="w-full border rounded p-2"
            value={formData.description}
            onChange={(e)=>setFormData({...formData,description:e.target.value})}
          />

          <textarea
            rows={2} placeholder="Requirements"
            className="w-full border rounded p-2"
            value={formData.requirements}
            onChange={(e)=>setFormData({...formData,requirements:e.target.value})}
          />

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSubmit}>
              {editingId? 'Update':'Create'}
            </Button>
            <Button className="flex-1" variant="outline" onClick={handleCloseModal}>Cancel</Button>
          </div>

        </div>
      </Modal>
    </div>
  );
}
