'use client';

import { createContext, ReactNode, useContext, useRef, useState } from 'react';

type DragDropContextType = {
  isDragActive: boolean;
  setIsDragActive: (active: boolean) => void;
  onFilesDropped: (files: File[]) => void;
  setOnFilesDropped: (callback: (files: File[]) => void) => void;
};

const DragDropContext = createContext<DragDropContextType | undefined>(
  undefined,
);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

type DragDropProviderProps = {
  children: ReactNode;
};

export const DragDropProvider = ({ children }: DragDropProviderProps) => {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const onFilesDroppedRef = useRef<(files: File[]) => void>(() => {});

  const contextValue = useRef({
    isDragActive,
    setIsDragActive,
    onFilesDropped: (files: File[]) => onFilesDroppedRef.current(files),
    setOnFilesDropped: (callback: (files: File[]) => void) => {
      onFilesDroppedRef.current = callback;
    },
  });

  // Update context value when state changes
  contextValue.current.isDragActive = isDragActive;
  contextValue.current.setIsDragActive = setIsDragActive;

  return (
    <DragDropContext.Provider value={contextValue.current}>
      {children}
    </DragDropContext.Provider>
  );
};
