import {
  AppBar,
  Box,
  Button,
  Chip,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useTodo } from '../../context/TodoContext';

function Header() {
  const { totalTasks, unfinishedCount, mode, actions } = useTodo();

  const handleReset = () => {
    const accepted = window.confirm('Êtes-vous sûr(e) de vouloir repartir de zéro ?');
    if (accepted) {
      actions.resetToEmpty();
    }
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e6e6e6' }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Todo List Étudiant
          </Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip label={`Total tâches: ${totalTasks}`} color="primary" variant="outlined" />
            <Chip label={`Non finies: ${unfinishedCount}`} color="secondary" variant="outlined" />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<TaskAltIcon />}
            variant={mode === 'task' ? 'contained' : 'outlined'}
            onClick={() => actions.setMode('task')}
          >
            Tâches
          </Button>
          <Button
            startIcon={<FolderOpenIcon />}
            variant={mode === 'folder' ? 'contained' : 'outlined'}
            onClick={() => actions.setMode('folder')}
          >
            Dossiers
          </Button>
          <Button startIcon={<RestartAltIcon />} color="error" onClick={handleReset}>
            Repartir de zéro
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
