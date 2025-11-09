import React, { useState } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import Card from '../ui/Card';

const BulkQuestionUpload = ({ quizId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setPreview(null);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await adminService.previewQuestionsFromPDF(selectedFile);
      if (result.success) {
        setPreview(result.data);
        setShowPreview(true);
      } else {
        toast.error(result.message || 'Failed to preview questions');
      }
    } catch (error) {
      toast.error('Error processing PDF file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !quizId) return;

    setIsUploading(true);
    try {
      const result = await adminService.uploadQuestionsFromPDF(selectedFile, quizId);
      if (result.success) {
        toast.success(`Successfully uploaded questions!`);
        onSuccess?.();
        resetForm();
      } else {
        toast.error(result.message || 'Failed to upload questions');
      }
    } catch (error) {
      toast.error('Error uploading questions');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setShowPreview(false);
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Questions from PDF</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label 
            htmlFor="pdf-upload"
            className="cursor-pointer block"
          >
            <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {selectedFile ? selectedFile.name : 'Click to select or drag & drop PDF'}
            </p>
          </label>
        </div>

        {selectedFile && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePreview}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Preview
            </button>
            {preview && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload Questions
              </button>
            )}
          </div>
        )}

        {showPreview && preview && (
          <div className="mt-6 border rounded-lg p-4">
            <div className="mb-4 flex justify-between items-center">
              <h4 className="font-medium">
                Preview: {preview.questions?.length} Questions Found
              </h4>
              <button
                onClick={() => setShowPreview(false)}
                className="text-blue-600"
              >
                Hide Preview
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {preview.questions?.slice(0, 3).map((q, i) => (
                <div key={i} className="border p-4 rounded">
                  <p className="font-medium mb-2">Q{i + 1}: {q.questionText}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, j) => (
                      <div
                        key={j}
                        className={`p-2 rounded text-sm ${
                          j === q.correctAnswer
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + j)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BulkQuestionUpload;