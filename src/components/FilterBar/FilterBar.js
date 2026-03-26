import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useTodo } from '../../context/TodoContext';
import { getColorFromName, getIconComponent, getStatusIcon, getStatusColor } from '../../utils/colorMapping';

function FilterBar() {
  const { folders, etats, sortBy, filters, actions } = useTodo();

  return (
    <Box sx={{ p: 2, border: '1px solid #ececec', borderRadius: 2, backgroundColor: '#fff' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="sort-label">Tri</InputLabel>
          <Select
            labelId="sort-label"
            label="Tri"
            value={sortBy}
            onChange={(event) => actions.setSort(event.target.value)}
          >
            <MenuItem value="dueDesc">Date échéance (desc)</MenuItem>
            <MenuItem value="created">Date creation</MenuItem>
            <MenuItem value="name">Nom</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="status-filter-label">Filtres états</InputLabel>
          <Select
            labelId="status-filter-label"
            multiple
            value={filters.statusFilters}
            onChange={(event) => actions.setStatusFilters(event.target.value)}
            input={<OutlinedInput label="Filtres états" />}
            renderValue={(selected) => (
              <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto' }}>
                {selected.map((value) => {
                  const StatusIcon = getStatusIcon(value);
                  return (
                    <Chip
                      key={value}
                      size="small"
                      label={value}
                      icon={StatusIcon ? <StatusIcon /> : undefined}
                      sx={{
                        bgcolor: getStatusColor(value),
                        color: '#fff',
                      }}
                    />
                  );
                })}
              </Stack>
            )}
          >
            {etats.map((etat) => {
              const StatusIcon = getStatusIcon(etat);
              return (
                <MenuItem key={etat} value={etat}>
                  <Checkbox checked={filters.statusFilters.includes(etat)} />
                  <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                    {StatusIcon && <StatusIcon sx={{ fontSize: 18 }} />}
                    <ListItemText primary={etat} />
                  </Stack>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 260 }}>
          <InputLabel id="folder-filter-label">Filtre Dossiers</InputLabel>
          <Select
            labelId="folder-filter-label"
            multiple
            value={filters.folderFilters}
            onChange={(event) => actions.setFolderFilters(event.target.value)}
            input={<OutlinedInput label="Filtre Dossiers" />}
            renderValue={(selected) => (
              <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto' }}>
                {selected.map((id) => {
                  const found = folders.find((folder) => folder.id === id);
                  const FolderIcon = found ? getIconComponent(found.icon) : null;
                  return (
                    <Chip
                      key={id}
                      size="small"
                      label={found ? found.title : id}
                      icon={FolderIcon ? <FolderIcon /> : undefined}
                      sx={
                        found
                          ? {
                              bgcolor: getColorFromName(found.color),
                              color: '#fff',
                            }
                          : {}
                      }
                    />
                  );
                })}
              </Stack>
            )}
          >
            {folders.map((folder) => {
              const FolderIcon = getIconComponent(folder.icon);
              return (
                <MenuItem key={folder.id} value={folder.id}>
                  <Checkbox checked={filters.folderFilters.includes(folder.id)} />
                  <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                    {FolderIcon && <FolderIcon sx={{ fontSize: 18 }} />}
                    <ListItemText primary={folder.title} />
                  </Stack>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">Filtre actif (non terminées)</Typography>
          <Switch
            checked={filters.onlyActive}
            onChange={(event) => actions.setOnlyActive(event.target.checked)}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">Masquer échéances dépassées &gt; 1 semaine</Typography>
          <Switch
            checked={filters.hideWeekOldOverdue}
            onChange={(event) => actions.setHideWeekOldOverdue(event.target.checked)}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

export default FilterBar;
