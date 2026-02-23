// import { useState, useEffect } from 'react';
// import { Search, Upload, Download, Edit, Trash2 } from 'lucide-react';
// import { Card } from '../../components/ui/Card';
// import { Input } from '../../components/ui/Input';
// import { Button } from '../../components/ui/Button';
// import { motion } from 'framer-motion';
// import { userManagementService, User } from '../../services/userManagementService';

// export function UsersManagement() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showImportModal, setShowImportModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   // ========= Fetch all users =========
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await userManagementService.getUsers();
//       setUsers(res);
//     } catch (err) {
//       alert('Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // ========= Filtered users =========
//   const filteredUsers = users.filter(user =>
//     user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     user.role.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // ========= Role badge color =========
//   const getRoleBadgeColor = (role: string) => {
//     switch (role) {
//       case 'admin': return 'bg-purple-100 text-purple-700';
//       case 'alumni': return 'bg-blue-100 text-blue-700';
//       case 'student': return 'bg-green-100 text-green-700';
//       default: return 'bg-gray-100 text-gray-700';
//     }
//   };

//   // ========= Download CSV template =========
//   const handleTemplateDownload = () => {
//     const template = 
// `fullName,email,role,department,graduationYear,company,position
// John Doe,john@example.com,student,Computer Science,2025,,
// Sarah Lee,sarah@example.com,alumni,,2020,Google,Software Engineer`;

//     const blob = new Blob([template], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "users_template.csv";
//     a.click();
//   };

//   // ========= File selection =========
//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) setSelectedFile(file);
//   };

//   // ========= Bulk import =========
//   const handleBulkImport = async () => {
//     if (!selectedFile) {
//       alert('Please select a file first');
//       return;
//     }
//     try {
//       const formData = new FormData();
//       formData.append('file', selectedFile);
//       await userManagementService.uploadUsers(formData);
//       alert('Users imported successfully');
//       setSelectedFile(null);
//       setShowImportModal(false);
//       fetchUsers();
//     } catch (err: any) {
//       alert('Import failed: ' + err.message || 'Unknown error');
//     }
//   };

//   // ========= Delete user =========
//   const handleDelete = async (id: string) => {
//     if (!window.confirm('Delete this user?')) return;
//     try {
//       await userManagementService.deleteUser(id);
//       fetchUsers();
//     } catch (err) {
//       alert('Failed to delete user');
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
//           <p className="text-gray-600 mt-1">Manage all platform users</p>
//         </div>

//         <Button 
//           className="flex items-center space-x-2"
//           onClick={() => setShowImportModal(true)}
//         >
//           <Upload className="w-4 h-4" />
//           <span>Import Users</span>
//         </Button>
//       </div>

//       {/* Search */}
//       <Card>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <Input
//             type="text"
//             placeholder="Search users by name, email, or role..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//       </Card>

//       {/* Users List */}
//       {loading ? (
//         <p className="text-center py-10 text-gray-500">Loading users...</p>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//           {filteredUsers.map((user, index) => (
//             <motion.div
//               key={user._id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//             >
//               <Card hover>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-4">
//                     {user.avatarUrl && (
//                       <img
//                         src={user.avatarUrl}
//                         alt={user.fullName}
//                         className="w-16 h-16 rounded-full object-cover"
//                       />
//                     )}
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
//                       <p className="text-sm text-gray-600">{user.email}</p>
//                       <div className="flex items-center space-x-2 mt-2">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
//                           {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                         </span>
//                         {user.department && <span className="text-xs text-gray-500">• {user.department}</span>}
//                         {user.graduationYear && <span className="text-xs text-gray-500">• Graduation Year {user.graduationYear}</span>}
//                       </div>
//                       {user.company && (
//                         <p className="text-sm text-gray-600 mt-1">{user.position} at {user.company}</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
//                     <Button variant="danger" size="sm" onClick={() => handleDelete(user._id)}><Trash2 className="w-4 h-4" /></Button>
//                   </div>
//                 </div>
//               </Card>
//             </motion.div>
//           ))}

//           {filteredUsers.length === 0 && (
//             <Card>
//               <div className="text-center py-12">
//                 <p className="text-gray-500">No users found matching your search.</p>
//               </div>
//             </Card>
//           )}
//         </div>
//       )}

//       {/* Import Modal */}
//       {showImportModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
//             <h2 className="text-xl font-bold text-gray-900">Import Users</h2>
//             <p className="text-gray-600 text-sm">Download the template and upload filled user data.</p>

//             {/* Template Download */}
//             <Button 
//               variant="outline"
//               className="flex items-center space-x-2 w-full justify-center"
//               onClick={handleTemplateDownload}
//             >
//               <Download className="w-4 h-4" />
//               <span>Download Template</span>
//             </Button>

//             {/* File Upload */}
//             <div className="border border-gray-300 rounded-lg p-4">
//               <input 
//                 type="file" 
//                 accept=".csv,.xlsx"
//                 onChange={handleFileUpload}
//               />
//               {selectedFile && (
//                 <p className="mt-2 text-sm text-green-600">Selected: {selectedFile.name}</p>
//               )}
//             </div>

//             {/* Import Action */}
//             <Button className="w-full" onClick={handleBulkImport}>Import Users</Button>

//             <Button 
//               variant="outline" 
//               className="w-full mt-2"
//               onClick={() => setShowImportModal(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { userManagementService, User } from '../../services/userManagementService';
import { ImportUsersButton } from './ImportUsersButton'; // ⬅️ NEW COMPONENT

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ========= Fetch all users =========
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userManagementService.getUsers();
      setUsers(res);
    } catch (err) {
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ========= Filtered users =========
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========= Role badge color =========
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'alumni': return 'bg-blue-100 text-blue-700';
      case 'student': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ========= Delete user =========
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userManagementService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>

        {/* ⬅️ NEW IMPORT BUTTON */}
        <ImportUsersButton onSuccess={fetchUsers} />
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Users List */}
      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading users...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.avatarUrl && (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        {user.department && <span className="text-xs text-gray-500">• {user.department}</span>}
                        {user.graduationYear && <span className="text-xs text-gray-500">• Graduation Year {user.graduationYear}</span>}
                      </div>
                      {user.company && (
                        <p className="text-sm text-gray-600 mt-1">{user.position} at {user.company}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(user._id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">No users found matching your search.</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}


// import { useState } from 'react';
// import { Search, Upload, Download, Edit, Trash2 } from 'lucide-react';
// import { Card } from '../../components/ui/Card';
// import { Input } from '../../components/ui/Input';
// import { Button } from '../../components/ui/Button';
// import { storage } from '../../lib/storage';
// import { motion } from 'framer-motion';

// export function UsersManagement() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showImportModal, setShowImportModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   const users = storage.getUsers();

//   const filteredUsers = users.filter(user =>
//     user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     user.role.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const getRoleBadgeColor = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-purple-100 text-purple-700';
//       case 'alumni':
//         return 'bg-blue-100 text-blue-700';
//       case 'student':
//         return 'bg-green-100 text-green-700';
//       default:
//         return 'bg-gray-100 text-gray-700';
//     }
//   };

//   const handleTemplateDownload = () => {
//     const template = 
// `fullName,email,role,department,graduationYear,company,position
// John Doe,john@example.com,student,Computer Science,2025,,
// Sarah Lee,sarah@example.com,alumni,,2020,Google,Software Engineer`;

//     const blob = new Blob([template], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "users_template.csv";
//     a.click();
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) setSelectedFile(file);
//   };

//   return (
//     <div className="space-y-6">
      
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
//           <p className="text-gray-600 mt-1">Manage all platform users</p>
//         </div>

//         {/* Import Users Button */}
//         <Button 
//           className="flex items-center space-x-2"
//           onClick={() => setShowImportModal(true)}
//         >
//           <Upload className="w-4 h-4" />
//           <span>Import Users</span>
//         </Button>
//       </div>

//       {/* Search */}
//       <Card>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <Input
//             type="text"
//             placeholder="Search users by name, email, or role..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//       </Card>

//       {/* Users List */}
//       <div className="grid grid-cols-1 gap-4">
//         {filteredUsers.map((user, index) => (
//           <motion.div
//             key={user.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.05 }}
//           >
//             <Card hover>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">

//                   {user.avatarUrl && (
//                     <img
//                       src={user.avatarUrl}
//                       alt={user.fullName}
//                       className="w-16 h-16 rounded-full object-cover"
//                     />
//                   )}

//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
//                     <p className="text-sm text-gray-600">{user.email}</p>

//                     <div className="flex items-center space-x-2 mt-2">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
//                         {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                       </span>
//                       {user.department && <span className="text-xs text-gray-500">• {user.department}</span>}
//                       {user.graduationYear && <span className="text-xs text-gray-500">• Class of {user.graduationYear}</span>}
//                     </div>

//                     {user.company && (
//                       <p className="text-sm text-gray-600 mt-1">
//                         {user.position} at {user.company}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
//                   <Button variant="danger" size="sm"><Trash2 className="w-4 h-4" /></Button>
//                 </div>

//               </div>
//             </Card>
//           </motion.div>
//         ))}
//       </div>

//       {filteredUsers.length === 0 && (
//         <Card>
//           <div className="text-center py-12">
//             <p className="text-gray-500">No users found matching your search.</p>
//           </div>
//         </Card>
//       )}

//       {/* Import Modal */}
//       {showImportModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">

//             <h2 className="text-xl font-bold text-gray-900">Import Users</h2>
//             <p className="text-gray-600 text-sm">Download the template and upload filled user data.</p>

//             {/* Template Download */}
//             <Button 
//               variant="outline"
//               className="flex items-center space-x-2 w-full justify-center"
//               onClick={handleTemplateDownload}
//             >
//               <Download className="w-4 h-4" />
//               <span>Download Template</span>
//             </Button>

//             {/* File Upload */}
//             <div className="border border-gray-300 rounded-lg p-4">
//               <input 
//                 type="file" 
//                 accept=".csv,.xlsx"
//                 onChange={handleFileUpload}
//               />

//               {selectedFile && (
//                 <p className="mt-2 text-sm text-green-600">
//                   Selected: {selectedFile.name}
//                 </p>
//               )}
//             </div>

//             {/* Import Action */}
//             <Button className="w-full">
//               Import Users
//             </Button>

//             {/* Close */}
//             <Button 
//               variant="outline" 
//               className="w-full mt-2"
//               onClick={() => setShowImportModal(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
