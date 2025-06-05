import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

interface Message {
  text: string;
  isUser: boolean;
  sources?: Array<{
    text: string;
    page: number;
    pdf_name: string;
    similarity: number;
  }>;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        text: userMessage,
        pdf_ids: []  // Empty array means search all PDFs
      });

      setMessages(prev => [...prev, {
        text: response.data.response,
        isUser: false,
        sources: response.data.sources
      }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.isUser ? 'primary.main' : 'background.paper',
                color: message.isUser ? 'primary.contrastText' : 'text.primary'
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.text}
              </Typography>
              {message.sources && (
                <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Sources:
                  </Typography>
                  {message.sources.map((source, idx) => (
                    <Typography key={idx} variant="caption" display="block" color="text.secondary">
                      {source.pdf_name} (Page {source.page})
                    </Typography>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        ))}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ minWidth: 100 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface; 