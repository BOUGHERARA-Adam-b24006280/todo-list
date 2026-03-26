import { useState } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from './components/Header/Header';
import FilterBar from './components/FilterBar/FilterBar';
import TaskList from './components/TaskList/TaskList';
import FolderView from './components/FolderView/FolderView';
import Footer from './components/Footer/Footer';
import CreateModal from './components/CreateModal/CreateModal';
import { TodoProvider, useTodo } from './context/TodoContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#235789',
    },
    secondary: {
      main: '#c1292e',
    },
    background: {
      default: '#fffaf4',
    },
  },
  shape: {
    borderRadius: 14,
  },
});

function AppContent() {
  const { mode } = useTodo();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState('task');

  const openTaskModal = () => {
    setDefaultTab('task');
    setModalOpen(true);
  };

  const openFolderModal = () => {
    setDefaultTab('folder');
    setModalOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          {mode === 'task' && <FilterBar />}
          {mode === 'task' ? <TaskList /> : <FolderView />}
        </Box>
      </Container>

      <Container maxWidth="lg">
        <Footer onAddTask={openTaskModal} onAddFolder={openFolderModal} />
      </Container>

      <CreateModal open={modalOpen} onClose={() => setModalOpen(false)} defaultTab={defaultTab} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}

export default App;
