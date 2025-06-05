import React, { useCallback, useState } from 'react';
import { Box, Typography, Paper, Alert, Snackbar } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface PDFUploaderProps {
  onUpload: (pdfs: { name: string; id: string }[]) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setError('Please select PDF files only');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      console.log('Uploading files:', acceptedFiles.map(f => f.name));
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        const uploadedPDFs = response.data.files.map((file: any) => ({
          name: file.filename,
          id: file.id
        }));
        onUpload(uploadedPDFs);
      } else {
        setError('Upload failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error uploading PDFs:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to upload PDFs');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          opacity: uploading ? 0.7 : 1,
          pointerEvents: uploading ? 'none' : 'auto',
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="h6" gutterBottom>
          {uploading 
            ? 'Uploading...' 
            : isDragActive 
              ? 'Drop the PDFs here' 
              : 'Drag and drop PDFs here, or click to select files'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Only PDF files are accepted
        </Typography>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PDFUploader; 