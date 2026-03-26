import { Box, Fab, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

function Footer({ onAddTask, onAddFolder }) {
  return (
    <Box
      component="footer"
      sx={{
        position: 'sticky',
        bottom: 0,
        py: 2,
      }}
    >
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Fab color="secondary" onClick={onAddFolder} aria-label="Ajouter un dossier">
          <CreateNewFolderIcon />
        </Fab>
        <Fab color="primary" onClick={onAddTask} aria-label="Ajouter une tache">
          <AddIcon />
        </Fab>
      </Stack>
    </Box>
  );
}

export default Footer;
