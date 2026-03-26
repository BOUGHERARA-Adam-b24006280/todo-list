import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { DOSSIER_COLORS, DOSSIER_ICONS, ETATS } from '../../enums';
import { useTodo } from '../../context/TodoContext';
import { getColorFromName, getIconComponent, getStatusIcon } from '../../utils/colorMapping';

const initialTask = {
  title: '',
  description: '',
  dateEcheance: '',
  etat: ETATS.NOUVEAU,
  equipiers: '',
  folderIds: [],
};

const initialFolder = {
  title: '',
  description: '',
  color: DOSSIER_COLORS[0],
  icon: '',
};

function CreateModal({ open, onClose, defaultTab = 'task' }) {
  const { folders, actions } = useTodo();
  const [tab, setTab] = useState(defaultTab);
  const [task, setTask] = useState(initialTask);
  const [folder, setFolder] = useState(initialFolder);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setErrors({});
    }
  }, [open, defaultTab]);

  const currentTitle = useMemo(() => {
    return tab === 'task' ? 'Créer une tâche' : 'Créer un dossier';
  }, [tab]);

  const validateTask = () => {
    const nextErrors = {};
    if (!task.title || task.title.trim().length < 5) {
      nextErrors.taskTitle = 'Intitulé obligatoire (5 caractères minimum).';
    }
    if (!task.dateEcheance) {
      nextErrors.taskDate = 'Date échéance obligatoire.';
    }
    if (!task.etat) {
      nextErrors.taskStatus = 'Statut obligatoire.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateFolder = () => {
    const nextErrors = {};
    if (!folder.title || folder.title.trim().length < 3) {
      nextErrors.folderTitle = 'Intitulé obligatoire (3 caractères minimum).';
    }
    if (!DOSSIER_COLORS.includes(folder.color)) {
      nextErrors.folderColor = 'Couleur invalide.';
    }
    if (folder.icon && !DOSSIER_ICONS.includes(folder.icon)) {
      nextErrors.folderIcon = 'Pictogramme invalide.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (tab === 'task') {
      if (!validateTask()) {
        return;
      }
      actions.addTask({
        title: task.title.trim(),
        description: task.description,
        dateEcheance: task.dateEcheance,
        etat: task.etat,
        equipiers: task.equipiers
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        folderIds: task.folderIds,
      });
      setTask(initialTask);
      onClose();
      return;
    }

    if (!validateFolder()) {
      return;
    }

    actions.addFolder({
      title: folder.title.trim(),
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
    });
    setFolder(initialFolder);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{currentTitle}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, nextTab) => setTab(nextTab)} sx={{ mb: 2 }}>
          <Tab label="Tâche" value="task" />
          <Tab label="Dossier" value="folder" />
        </Tabs>

        {tab === 'task' && (
          <Stack spacing={2}>
            <TextField
              label="Intitulé"
              value={task.title}
              onChange={(event) => setTask((prev) => ({ ...prev, title: event.target.value }))}
              helperText={errors.taskTitle || '5 caractères minimum'}
              error={Boolean(errors.taskTitle)}
            />
            <TextField
              label="Description"
              value={task.description}
              multiline
              minRows={2}
              onChange={(event) =>
                setTask((prev) => ({ ...prev, description: event.target.value }))
              }
            />
            <TextField
              type="date"
              label="Date échéance"
              InputLabelProps={{ shrink: true }}
              value={task.dateEcheance}
              onChange={(event) =>
                setTask((prev) => ({ ...prev, dateEcheance: event.target.value }))
              }
              error={Boolean(errors.taskDate)}
              helperText={errors.taskDate}
            />
            <FormControl error={Boolean(errors.taskStatus)}>
              <InputLabel id="task-status-label">Statut</InputLabel>
              <Select
                labelId="task-status-label"
                label="Statut"
                value={task.etat}
                onChange={(event) => setTask((prev) => ({ ...prev, etat: event.target.value }))}
              >
                {Object.values(ETATS).map((etat) => {
                  const StatusIcon = getStatusIcon(etat);
                  return (
                    <MenuItem key={etat} value={etat}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {StatusIcon && <StatusIcon />}
                        <span>{etat}</span>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </Select>
              {errors.taskStatus && <FormHelperText>{errors.taskStatus}</FormHelperText>}
            </FormControl>
            <TextField
              label="Liste équipiers"
              helperText="Tableau de string séparé par virgules"
              value={task.equipiers}
              onChange={(event) =>
                setTask((prev) => ({ ...prev, equipiers: event.target.value }))
              }
            />
            <FormControl>
              <InputLabel id="task-folder-label">Dossiers</InputLabel>
              <Select
                labelId="task-folder-label"
                multiple
                value={task.folderIds}
                onChange={(event) =>
                  setTask((prev) => ({ ...prev, folderIds: event.target.value }))
                }
                input={<OutlinedInput label="Dossiers" />}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto' }}>
                    {folders
                      .filter((folderItem) => selected.includes(folderItem.id))
                      .map((folderItem) => {
                        const FolderIcon = getIconComponent(folderItem.icon);
                        return (
                          <Chip
                            key={folderItem.id}
                            size="small"
                            label={folderItem.title}
                            icon={FolderIcon ? <FolderIcon /> : undefined}
                            sx={{
                              bgcolor: getColorFromName(folderItem.color),
                              color: '#fff',
                            }}
                          />
                        );
                      })}
                  </Stack>
                )}
              >
                {folders.map((folderItem) => {
                  const FolderIcon = getIconComponent(folderItem.icon);
                  return (
                    <MenuItem key={folderItem.id} value={folderItem.id}>
                      <Checkbox checked={task.folderIds.includes(folderItem.id)} />
                      <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                        {FolderIcon && <FolderIcon sx={{ fontSize: 18 }} />}
                        <ListItemText primary={folderItem.title} />
                      </Stack>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
        )}

        {tab === 'folder' && (
          <Stack spacing={2}>
            <TextField
              label="Intitulé"
              value={folder.title}
              onChange={(event) =>
                setFolder((prev) => ({ ...prev, title: event.target.value }))
              }
              helperText={errors.folderTitle || '3 caractères minimum'}
              error={Boolean(errors.folderTitle)}
            />
            <TextField
              label="Description"
              value={folder.description}
              multiline
              minRows={2}
              onChange={(event) =>
                setFolder((prev) => ({ ...prev, description: event.target.value }))
              }
            />
            <FormControl error={Boolean(errors.folderColor)}>
              <InputLabel id="folder-color">Couleur</InputLabel>
              <Select
                labelId="folder-color"
                label="Couleur"
                value={folder.color}
                onChange={(event) =>
                  setFolder((prev) => ({ ...prev, color: event.target.value }))
                }
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
              {errors.folderColor && <FormHelperText>{errors.folderColor}</FormHelperText>}
            </FormControl>

            <FormControl error={Boolean(errors.folderIcon)}>
              <InputLabel id="folder-icon">Pictogramme (option)</InputLabel>
              <Select
                labelId="folder-icon"
                label="Pictogramme (option)"
                value={folder.icon}
                onChange={(event) =>
                  setFolder((prev) => ({ ...prev, icon: event.target.value }))
                }
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
              {errors.folderIcon && <FormHelperText>{errors.folderIcon}</FormHelperText>}
            </FormControl>
          </Stack>
        )}

        <Box mt={1} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Creer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateModal;
