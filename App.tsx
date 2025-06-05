import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, IconButton, Paper, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Button } from '@mui/material';
import { Brightness4, Brightness7, Delete as DeleteIcon } from '@mui/icons-material';
import PDFUploader from './components/PDFUploader';
import ChatInterface from './components/ChatInterface';
import axios from 'axios';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [uploadedPDFs, setUploadedPDFs] = useState<Array<{ name: string; id: string }>>([]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleUpload = (pdfs: Array<{ name: string; id: string }>) => {
    setUploadedPDFs(prev => [...prev, ...pdfs]);
  };

  const handleDelete = async (pdfName: string) => {
    try {
      await axios.delete(`http://localhost:8000/pdf/${pdfName}`);
      setUploadedPDFs(prev => prev.filter(pdf => pdf.name !== pdfName));
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6">PDF Chatbot</Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        <Box sx={{ 
          flex: 1,
          display: 'flex',
          p: 2,
          gap: 2,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          <Box sx={{ 
            width: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <PDFUploader onUpload={handleUpload} />
            <Paper sx={{ p: 2, flex: 1, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Uploaded PDFs
              </Typography>
              {uploadedPDFs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No PDFs uploaded yet
                </Typography>
              ) : (
                <List>
                  {uploadedPDFs.map((pdf) => (
                    <ListItem
                      key={pdf.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={pdf.name}
                        primaryTypographyProps={{
                          noWrap: true,
                          title: pdf.name
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(pdf.name)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ChatInterface />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 