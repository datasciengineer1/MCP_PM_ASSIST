
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid Date';
  
  return format(dateObj, 'MMM d, yyyy');
};

export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid Date';
  
  return format(dateObj, 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid Date';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};
