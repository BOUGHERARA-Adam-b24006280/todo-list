import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddLinkIcon from '@mui/icons-material/AddLink';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { useTodo } from '../../context/TodoContext';
import { getColorFromName, getIconComponent, getStatusIcon, getStatusColor } from '../../utils/colorMapping';

function TaskItem({ task }) {
  const { folders, etats, filters, actions } = useTodo();
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description || '',
    date_echeance: task.date_echeance,
    etat: task.etat,
    equipiers: (task.equipiers || []).join(', '),
  });

  const modeSimpleFolders = task.dossiers.slice(0, 2);
  const remainingFolders = folders.filter(
    (folder) => !task.dossiers.some((linked) => linked.id === folder.id)
  );

  const handleSave = () => {
    if (!draft.title || draft.title.trim().length < 5) {
      return;
    }
    if (!draft.date_echeance) {
      return;
    }

    actions.updateTask(task.id, {
      title: draft.title.trim(),
      description: draft.description,
      date_echeance: draft.date_echeance,
      etat: draft.etat,
      equipiers: draft.equipiers
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
    });

    setIsEditing(false);
  };

  const activateFolderFilter = (folderId) => {
    if (filters.folderFilters.includes(folderId)) {
      actions.setFolderFilters(filters.folderFilters.filter((id) => id !== folderId));
    } else {
      actions.setFolderFilters([...filters.folderFilters, folderId]);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getStatusColor(task.etat),
                  fontSize: '0.9rem',
                }}
              >
                {(() => {
                  const StatusIcon = getStatusIcon(task.etat);
                  return StatusIcon ? <StatusIcon sx={{ fontSize: 18 }} /> : task.etat.charAt(0);
                })()}
              </Avatar>
              <Typography variant="h6" sx={{ mb: 0 }}>{task.title}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Échéance: {task.date_echeance}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              État: <span style={{ color: getStatusColor(task.etat), fontWeight: 600 }}>{task.etat}</span>
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => setExpanded((prev) => !prev)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
          {modeSimpleFolders.length === 0 ? (
            <Chip size="small" label="Aucun dossier" variant="outlined" />
          ) : (
            modeSimpleFolders.map((folder) => {
              const FolderIcon = getIconComponent(folder.icon);
              return (
                <Chip
                  key={folder.id}
                  size="small"
                  label={folder.title}
                  icon={FolderIcon ? <FolderIcon /> : undefined}
                  onClick={() => activateFolderFilter(folder.id)}
                  sx={{
                    bgcolor: getColorFromName(folder.color),
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
              );
            })
          )}
        </Stack>

        {expanded && (
          <Stack spacing={2} mt={2}>
            <Typography variant="body2">Description: {task.description || 'Aucune'}</Typography>
            <Typography variant="body2">
              Équipiers: {(task.equipiers || []).length > 0 ? task.equipiers.join(', ') : 'Aucun'}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {task.dossiers.map((folder) => {
                const FolderIcon = getIconComponent(folder.icon);
                return (
                  <Chip
                    key={folder.id}
                    label={folder.title}
                    icon={FolderIcon ? <FolderIcon /> : undefined}
                    onClick={() => activateFolderFilter(folder.id)}
                    onDelete={() => actions.detachFolderFromTask(task.id, folder.id)}
                    deleteIcon={<UnfoldLessIcon />}
                    sx={{
                      bgcolor: getColorFromName(folder.color),
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '& .MuiChip-deleteIcon': {
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          color: '#fff',
                        },
                      },
                    }}
                  />
                );
              })}
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel id={`attach-folder-${task.id}`}>Ajouter dossier</InputLabel>
                <Select
                  labelId={`attach-folder-${task.id}`}
                  value={selectedFolderId}
                  label="Ajouter dossier"
                  onChange={(event) => setSelectedFolderId(event.target.value)}
                >
                  {remainingFolders.map((folder) => (
                    <MenuItem key={folder.id} value={folder.id}>
                      {folder.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                startIcon={<AddLinkIcon />}
                variant="outlined"
                onClick={() => {
                  if (!selectedFolderId) {
                    return;
                  }
                  actions.attachFolderToTask(task.id, selectedFolderId);
                  setSelectedFolderId('');
                }}
              >
                Lier
              </Button>
              <Button
                startIcon={<EditIcon />}
                variant={isEditing ? 'contained' : 'outlined'}
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? 'Fermer édition' : 'Éditer'}
              </Button>
            </Stack>

            {isEditing && (
              <Stack spacing={1}>
                <TextField
                  label="Intitulé"
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  helperText="5 caractères minimum"
                />
                <TextField
                  label="Description"
                  multiline
                  minRows={2}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
                <TextField
                  label="Date échéance"
                  type="date"
                  value={draft.date_echeance}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, date_echeance: event.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl>
                  <InputLabel id={`etat-${task.id}`}>Statut</InputLabel>
                  <Select
                    labelId={`etat-${task.id}`}
                    value={draft.etat}
                    label="Statut"
                    onChange={(event) => setDraft((prev) => ({ ...prev, etat: event.target.value }))}
                  >
                    {etats.map((etat) => (
                      <MenuItem key={etat} value={etat}>
                        {etat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Équipiers"
                  value={draft.equipiers}
                  helperText="Liste séparée par des virgules"
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, equipiers: event.target.value }))
                  }
                />
                <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave}>
                  Sauvegarder
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskItem;
