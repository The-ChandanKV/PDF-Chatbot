import React from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon, Typography, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Description as DescriptionIcon } from '@mui/icons-material';

interface PDFSidebarProps {
  pdfs: { name: string; id: string }[];
  selectedPDF: string | null;
  onSelectPDF: (id: string) => void;
  onDeletePDF: (id: string) => void;
}

const PDFSidebar: React.FC<PDFSidebarProps> = ({ pdfs, selectedPDF, onSelectPDF, onDeletePDF }) => {
  return (
    <Box sx={{ width: 250, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', height: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Uploaded PDFs
      </Typography>
      <List>
        {pdfs.map((pdf) => (
          <ListItem
            key={pdf.id}
            onClick={() => onSelectPDF(pdf.id)}
            sx={{
              cursor: 'pointer',
              bgcolor: selectedPDF === pdf.id ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePDF(pdf.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemIcon>
              <DescriptionIcon color={selectedPDF === pdf.id ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={pdf.name}
              primaryTypographyProps={{
                noWrap: true,
                style: { maxWidth: '150px' },
                color: selectedPDF === pdf.id ? 'primary' : 'inherit'
              }}
            />
          </ListItem>
        ))}
        {pdfs.length === 0 && (
          <ListItem>
            <ListItemText 
              primary="No PDFs uploaded"
              sx={{ color: 'text.secondary', textAlign: 'center' }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default PDFSidebar; 