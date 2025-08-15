
'use client';

import { useState, useEffect } from 'react';
import { formatDate, formatDateTime, formatRelativeTime } from '@/utils/date-utils';

interface ClientDateProps {
  date: Date | string | null | undefined;
  format?: 'date' | 'datetime' | 'relative';
}

export const ClientDate = ({ date, format: formatType = 'date' }: ClientDateProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Server-side rendering fallback to prevent hydration mismatch
    return <span>--</span>;
  }

  const formatters = {
    date: formatDate,
    datetime: formatDateTime,
    relative: formatRelativeTime,
  };

  return <span>{formatters[formatType](date)}</span>;
};
