import { createContext, useContext, useMemo, useReducer } from 'react';
import backupData from '../data.json';
import { ETAT_TERMINE, ETATS } from '../enums';

const TodoContext = createContext(null);

const INITIAL_FILTERS = {
  onlyActive: true,
  statusFilters: [],
  folderFilters: [],
  hideWeekOldOverdue: false,
};

function normalizeTask(task) {
  return {
    ...task,
    equipiers: Array.isArray(task.equipiers)
      ? task.equipiers.map((e) => (typeof e === 'string' ? e : e?.name)).filter(Boolean)
      : [],
  };
}

function initializeState() {
  return {
    tasks: (backupData.taches || []).map(normalizeTask),
    folders: backupData.dossiers || [],
    relations: backupData.relations || [],
    mode: 'task',
    sortBy: 'dueDesc',
    filters: INITIAL_FILTERS,
  };
}

function getNextId(items, startAt) {
  const maxId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), startAt);
  return maxId + 1;
}

function todoReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };

    case 'SET_SORT':
      return { ...state, sortBy: action.payload };

    case 'SET_ONLY_ACTIVE':
      return {
        ...state,
        filters: {
          ...state.filters,
          onlyActive: action.payload,
        },
      };

    case 'SET_HIDE_WEEK_OLD':
      return {
        ...state,
        filters: {
          ...state.filters,
          hideWeekOldOverdue: action.payload,
        },
      };

    case 'SET_STATUS_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          statusFilters: action.payload,
        },
      };

    case 'SET_FOLDER_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          folderFilters: action.payload,
        },
      };

    case 'ADD_TASK': {
      const id = getNextId(state.tasks, 100);
      const nextTask = {
        id,
        title: action.payload.title,
        description: action.payload.description || '',
        date_creation: new Date().toISOString().slice(0, 10),
        date_echeance: action.payload.dateEcheance,
        etat: action.payload.etat,
        equipiers: action.payload.equipiers || [],
      };

      const nextRelations = [...state.relations];
      (action.payload.folderIds || []).forEach((folderId) => {
        nextRelations.push({ tache: id, dossier: Number(folderId) });
      });

      return {
        ...state,
        tasks: [...state.tasks, nextTask],
        relations: nextRelations,
      };
    }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload.changes } : task
        ),
      };

    case 'ATTACH_FOLDER_TO_TASK': {
      const alreadyExists = state.relations.some(
        (relation) =>
          relation.tache === action.payload.taskId && relation.dossier === action.payload.folderId
      );
      if (alreadyExists) {
        return state;
      }
      return {
        ...state,
        relations: [
          ...state.relations,
          { tache: action.payload.taskId, dossier: action.payload.folderId },
        ],
      };
    }

    case 'DETACH_FOLDER_FROM_TASK':
      return {
        ...state,
        relations: state.relations.filter(
          (relation) =>
            !(
              relation.tache === action.payload.taskId &&
              relation.dossier === action.payload.folderId
            )
        ),
      };

    case 'ADD_FOLDER': {
      const id = getNextId(state.folders, 200);
      const nextFolder = {
        id,
        title: action.payload.title,
        description: action.payload.description || '',
        color: action.payload.color,
        icon: action.payload.icon || '',
      };
      return {
        ...state,
        folders: [...state.folders, nextFolder],
      };
    }

    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map((folder) =>
          folder.id === action.payload.id ? { ...folder, ...action.payload.changes } : folder
        ),
      };

    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter((folder) => folder.id !== action.payload),
        relations: state.relations.filter((relation) => relation.dossier !== action.payload),
      };

    case 'RESET_TO_EMPTY':
      return {
        tasks: [],
        folders: [],
        relations: [],
        mode: 'task',
        sortBy: 'dueDesc',
        filters: INITIAL_FILTERS,
      };

    default:
      return state;
  }
}

function isOverdueSinceMoreThanOneWeek(dateStr) {
  const today = new Date();
  const due = new Date(dateStr);
  const diffMs = today.getTime() - due.getTime();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  return diffMs > oneWeekMs;
}

function sortTasks(tasks, sortBy) {
  const sorted = [...tasks];
  sorted.sort((a, b) => {
    if (sortBy === 'created') {
      return new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
    }

    if (sortBy === 'name') {
      return a.title.localeCompare(b.title, 'fr');
    }

    return new Date(b.date_echeance).getTime() - new Date(a.date_echeance).getTime();
  });
  return sorted;
}

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, undefined, initializeState);

  const foldersById = useMemo(() => {
    return state.folders.reduce((acc, folder) => {
      acc[folder.id] = folder;
      return acc;
    }, {});
  }, [state.folders]);

  const taskFolderMap = useMemo(() => {
    return state.relations.reduce((acc, relation) => {
      if (!acc[relation.tache]) {
        acc[relation.tache] = [];
      }
      const folder = foldersById[relation.dossier];
      if (folder) {
        acc[relation.tache].push(folder);
      }
      return acc;
    }, {});
  }, [state.relations, foldersById]);

  const enrichedTasks = useMemo(() => {
    return state.tasks.map((task) => ({
      ...task,
      dossiers: taskFolderMap[task.id] || [],
    }));
  }, [state.tasks, taskFolderMap]);

  const totalTasks = state.tasks.length;
  const unfinishedCount = state.tasks.filter((task) => !ETAT_TERMINE.includes(task.etat)).length;

  const filteredAndSortedTasks = useMemo(() => {
    const { onlyActive, statusFilters, folderFilters, hideWeekOldOverdue } = state.filters;

    const filtered = enrichedTasks.filter((task) => {
      if (onlyActive && ETAT_TERMINE.includes(task.etat)) {
        return false;
      }

      if (hideWeekOldOverdue && isOverdueSinceMoreThanOneWeek(task.date_echeance)) {
        return false;
      }

      if (statusFilters.length > 0 && !statusFilters.includes(task.etat)) {
        return false;
      }

      if (folderFilters.length > 0) {
        const taskFolderIds = task.dossiers.map((folder) => folder.id);
        const hasAtLeastOne = folderFilters.some((folderId) => taskFolderIds.includes(folderId));
        if (!hasAtLeastOne) {
          return false;
        }
      }

      return true;
    });

    return sortTasks(filtered, state.sortBy);
  }, [enrichedTasks, state.filters, state.sortBy]);

  const value = {
    mode: state.mode,
    sortBy: state.sortBy,
    filters: state.filters,
    tasks: state.tasks,
    folders: state.folders,
    relations: state.relations,
    enrichedTasks,
    filteredAndSortedTasks,
    totalTasks,
    unfinishedCount,
    etats: Object.values(ETATS),
    actions: {
      setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),
      setSort: (sortBy) => dispatch({ type: 'SET_SORT', payload: sortBy }),
      setOnlyActive: (enabled) => dispatch({ type: 'SET_ONLY_ACTIVE', payload: enabled }),
      setHideWeekOldOverdue: (enabled) =>
        dispatch({ type: 'SET_HIDE_WEEK_OLD', payload: enabled }),
      setStatusFilters: (statuses) =>
        dispatch({ type: 'SET_STATUS_FILTERS', payload: statuses }),
      setFolderFilters: (folderIds) =>
        dispatch({
          type: 'SET_FOLDER_FILTERS',
          payload: folderIds.map(Number),
        }),
      addTask: (payload) => dispatch({ type: 'ADD_TASK', payload }),
      updateTask: (id, changes) => dispatch({ type: 'UPDATE_TASK', payload: { id, changes } }),
      attachFolderToTask: (taskId, folderId) =>
        dispatch({
          type: 'ATTACH_FOLDER_TO_TASK',
          payload: { taskId, folderId: Number(folderId) },
        }),
      detachFolderFromTask: (taskId, folderId) =>
        dispatch({
          type: 'DETACH_FOLDER_FROM_TASK',
          payload: { taskId, folderId: Number(folderId) },
        }),
      addFolder: (payload) => dispatch({ type: 'ADD_FOLDER', payload }),
      updateFolder: (id, changes) =>
        dispatch({ type: 'UPDATE_FOLDER', payload: { id, changes } }),
      deleteFolder: (id) => dispatch({ type: 'DELETE_FOLDER', payload: id }),
      resetToEmpty: () => dispatch({ type: 'RESET_TO_EMPTY' }),
    },
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo doit etre utilise dans TodoProvider');
  }
  return context;
}
