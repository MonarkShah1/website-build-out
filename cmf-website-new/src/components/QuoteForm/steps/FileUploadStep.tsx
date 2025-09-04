import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuoteFormStore } from '../../../stores/quoteFormStore';
import type { UploadedFile } from '../../../types/quote';

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg'],
  'application/octet-stream': ['.dwg', '.dxf', '.step', '.stp', '.stl', '.iges', '.igs', '.sat', '.x_t', '.x_b'],
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const FileUploadStep: React.FC = () => {
  const { formData, addFile, removeFile, updateFileStatus } = useQuoteFormStore();
  const [uploadError, setUploadError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError('');

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((e: any) => {
          if (e.code === 'file-too-large') {
            return `${file.name} is too large (max 25MB)`;
          }
          if (e.code === 'file-invalid-type') {
            return `${file.name} is not a supported file type`;
          }
          return e.message;
        });
        return errorMessages.join(', ');
      });
      setUploadError(errors.join('; '));
      return;
    }

    // Process accepted files
    acceptedFiles.forEach((file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date(),
        status: 'uploading',
        url: URL.createObjectURL(file),
      };

      // Add file to store with the actual File object
      addFile(uploadedFile, file);

      // Simulate upload (in production, this would upload to server/cloud)
      setTimeout(() => {
        updateFileStatus(fileId, 'success');
      }, 1500);
    });
  }, [addFile, updateFileStatus]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    maxFiles: 10,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (['pdf'].includes(ext || '')) return '📄';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
    if (['dwg', 'dxf', 'step', 'stp', 'stl'].includes(ext || '')) return '📐';
    if (['zip', 'rar'].includes(ext || '')) return '📦';
    return '📎';
  };

  return (
    <div className="form-step file-upload-step">
      <h2>Upload Files</h2>
      <p>Upload your CAD files, drawings, or specifications (optional but recommended).</p>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploadError ? 'error' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="dropzone-icon">📁</div>
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <>
              <p>Drag & drop files here, or click to browse</p>
              <span className="dropzone-hint">
                Supported: CAD files (.dwg, .dxf, .step, .stp, .stl), PDFs, Images
                <br />
                Max file size: 25MB | Max 10 files
              </span>
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="upload-error">
          {uploadError}
        </div>
      )}

      {formData.files.length > 0 && (
        <div className="uploaded-files">
          <h3>Uploaded Files ({formData.files.length})</h3>
          <div className="file-list">
            {formData.files.map((file) => (
              <div key={file.id} className={`file-item ${file.status}`}>
                <div className="file-icon">{getFileIcon(file.name)}</div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
                <div className="file-status">
                  {file.status === 'uploading' && (
                    <span className="loading-spinner">⏳</span>
                  )}
                  {file.status === 'success' && (
                    <span className="success-icon">✓</span>
                  )}
                  {file.status === 'error' && (
                    <span className="error-icon">✗</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="file-remove"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="file-upload-info">
        <h4>Why upload files?</h4>
        <ul>
          <li>Get more accurate quotes faster</li>
          <li>Reduce back-and-forth communication</li>
          <li>Ensure we understand your exact requirements</li>
          <li>Speed up production time</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadStep;