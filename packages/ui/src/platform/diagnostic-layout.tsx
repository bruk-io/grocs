import { createContext, useContext } from 'react';

// DIAGNOSTIC (TASK-36): throwaway, never merges. KitchenScene reports its window size up to StageLayout's overlay.
export const ReportWindow = createContext<(line: string) => void>(() => {});
export const useReportWindow = () => useContext(ReportWindow);
