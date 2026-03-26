import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useTodo } from '../../context/TodoContext';
import { getColorFromName, getIconComponent } from '../../utils/colorMapping';
import { DOSSIER_COLORS, DOSSIER_ICONS } from '../../enums';

function FolderCard({ folder, linkedTasksCount }) {
  const { actions } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: folder.title,
    description: folder.description || '',
    color: folder.color,
    icon: folder.icon || '',
  });

  const handleSave = () => {
    if (!draft.title || draft.title.trim().length < 3) {
      return;
    }
    actions.updateFolder(folder.id, {
      title: draft.title.trim(),
      description: draft.description,
      color: draft.color,
      icon: draft.icon,
    });
    setIsEditing(false);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        {!isEditing ? (
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: getColorFromName(folder.color),
                }}
              >
                {(() => {
                  const FolderIcon = getIconComponent(folder.icon);
                  return FolderIcon ? <FolderIcon /> : folder.title.charAt(0).toUpperCase();
                })()}
              </Avatar>
              <Box>
                <Typography variant="h6">{folder.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {folder.description || 'Aucune description'}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={folder.color}
                sx={{
                  bgcolor: getColorFromName(folder.color),
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
              <Chip label={`Icône: ${folder.icon || 'Aucune'}`} variant="outlined" />
              <Chip
                label={`${linkedTasksCount} tâche${linkedTasksCount !== 1 ? 's' : ''} liée${linkedTasksCount !== 1 ? 's' : ''}`}
                color="primary"
                variant="outlined"
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                Editer
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => actions.deleteFolder(folder.id)}
              >
                Supprimer
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <TextField
              label="Intitulé"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
            <TextField
              label="Description"
              value={draft.description}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, description: event.target.value }))
              }
            />
            <FormControl>
              <InputLabel id={`edit-color-${folder.id}`}>Couleur</InputLabel>
              <Select
                labelId={`edit-color-${folder.id}`}
                value={draft.color}
                label="Couleur"
                onChange={(event) => setDraft((prev) => ({ ...prev, color: event.target.value }))}
                renderValue={(value) => (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: getColorFromName(value),
                      }}
                    />
                    {value}
                  </Stack>
                )}
              >
                {DOSSIER_COLORS.map((color) => (
                  <MenuItem key={color} value={color} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: getColorFromName(color),
                        mr: 1,
                        fontSize: '0.7rem',
                      }}
                    />
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id={`edit-icon-${folder.id}`}>Pictogramme</InputLabel>
              <Select
                labelId={`edit-icon-${folder.id}`}
                value={draft.icon}
                label="Pictogramme"
                onChange={(event) => setDraft((prev) => ({ ...prev, icon: event.target.value }))}
                renderValue={(value) => {
                  if (!value) return 'Aucun';
                  const IconComp = getIconComponent(value);
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {IconComp && <IconComp />}
                      {value}
                    </Stack>
                  );
                }}
              >
                <MenuItem value="">Aucun</MenuItem>
                {DOSSIER_ICONS.map((iconName) => {
                  const IconComp = getIconComponent(iconName);
                  return (
                    <MenuItem key={iconName} value={iconName} sx={{ display: 'flex', alignItems: 'center' }}>
                      {IconComp && <IconComp sx={{ mr: 1 }} />}
                      {iconName}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave}>
                Sauvegarder
              </Button>
              <Button onClick={() => setIsEditing(false)}>Annuler</Button>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function FolderView() {
  const { folders, relations } = useTodo();

  if (folders.length === 0) {
    return <Alert severity="info">Aucun dossier. Utilise le bouton + pour en ajouter.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Dossiers: {folders.length}
      </Typography>
      {folders.map((folder) => {
        const linkedTasksCount = relations.filter((relation) => relation.dossier === folder.id).length;
        return <FolderCard key={folder.id} folder={folder} linkedTasksCount={linkedTasksCount} />;
      })}
    </Stack>
  );
}

export default FolderView;
