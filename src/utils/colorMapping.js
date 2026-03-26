import BookIcon from '@mui/icons-material/Book';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import HomeIcon from '@mui/icons-material/Home';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ProjectsIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WorkIcon from '@mui/icons-material/Work';

// Mappage couleurs noms -> couleurs MUI
export const COLOR_PALETTE = {
  red: '#ef5350',
  orange: '#ffa726',
  amber: '#ffb74d',
  yellow: '#ffee58',
  green: '#66bb6a',
  teal: '#26a69a',
  blue: '#42a5f5',
  cyan: '#29b6f6',
  indigo: '#5c6bc0',
  pink: '#ec407a',
};

// Mappage icônes noms -> composants React
export const ICON_MAP = {
  project: ProjectsIcon,
  work: WorkIcon,
  school: SchoolIcon,
  home: HomeIcon,
  code: CodeIcon,
  shopping: ShoppingCartIcon,
  calendar: CalendarMonthIcon,
  book: BookIcon,
};

// Icônes pour les états des tâches
export const STATUS_ICON_MAP = {
  'Nouveau': FiberNewIcon,
  'En cours': HourglassTopIcon,
  'En attente': PendingActionsIcon,
  'Réussi': CheckCircleIcon,
  'Abandonné': CancelIcon,
};

// Couleurs pour les états
export const STATUS_COLOR_MAP = {
  'Nouveau': '#5c6bc0',
  'En cours': '#29b6f6',
  'En attente': '#ffb74d',
  'Réussi': '#66bb6a',
  'Abandonné': '#ef5350',
};

export function getColorFromName(colorName) {
  return COLOR_PALETTE[colorName] || '#e0e0e0';
}

export function getIconComponent(iconName) {
  return ICON_MAP[iconName] || null;
}

export function getStatusIcon(status) {
  return STATUS_ICON_MAP[status] || null;
}

export function getStatusColor(status) {
  return STATUS_COLOR_MAP[status] || '#757575';
}
