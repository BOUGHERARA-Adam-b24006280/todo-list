import { Alert, Stack, Typography } from '@mui/material';
import { useTodo } from '../../context/TodoContext';
import TaskItem from '../TaskItem/TaskItem';

function TaskList() {
  const { filteredAndSortedTasks } = useTodo();

  if (filteredAndSortedTasks.length === 0) {
    return <Alert severity="info">Aucune tâche ne correspond aux filtres actuels.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Tâches affichées: {filteredAndSortedTasks.length}
      </Typography>
      {filteredAndSortedTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </Stack>
  );
}

export default TaskList;
