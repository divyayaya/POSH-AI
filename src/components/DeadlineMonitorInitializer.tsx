import { useEffect } from 'react';
import { deadlineMonitor } from '@/services/deadlineMonitor';

export const DeadlineMonitorInitializer = () => {
  useEffect(() => {
    // Start deadline monitoring when component mounts
    deadlineMonitor.startMonitoring();
    
    // Cleanup on unmount
    return () => {
      deadlineMonitor.stopMonitoring();
    };
  }, []);

  // This component doesn't render anything
  return null;
};