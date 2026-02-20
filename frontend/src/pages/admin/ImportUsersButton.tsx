import { useState } from "react";
import { Upload, Download } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { userManagementService } from "../../services/userManagementService";

/**
 * Reusable Import Users Component
 * Handles file selection, template download, and bulk upload API call
 */
export function ImportUsersButton({ onSuccess }: { onSuccess: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Download CSV template
  const handleTemplateDownload = () => {
    const template = `fullName,email,role,department,graduationYear,company,position
John Doe,john@example.com,student,Computer Science,2025,,
Sarah Lee,sarah@example.com,alumni,,2020,Google,Software Engineer`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_template.csv";
    a.click();
  };

  // Handle file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // Call bulk import API
  const handleBulkImport = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      setLoading(true);
    await userManagementService.bulkUploadUsers(selectedFile);

      alert("Users imported successfully");

      setSelectedFile(null);
      setShowModal(false);
      onSuccess(); // Refresh parent user list
    } catch (err: any) {
      alert("Import failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button that opens modal */}
      <Button className="flex items-center space-x-2" onClick={() => setShowModal(true)}>
        <Upload className="w-4 h-4" />
        <span>Import Users</span>
      </Button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Import Users</h2>
            <p className="text-gray-600 text-sm">Download the template and upload filled user data.</p>

            <Button
              variant="outline"
              className="flex items-center space-x-2 w-full justify-center"
              onClick={handleTemplateDownload}
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </Button>

            {/* File upload */}
            <div className="border border-gray-300 rounded-lg p-4">
              <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600">Selected: {selectedFile.name}</p>
              )}
            </div>

            <Button className="w-full" onClick={handleBulkImport} disabled={loading}>
              {loading ? "Importing..." : "Import Users"}
            </Button>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
