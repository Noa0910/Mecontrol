import React, { createContext, useContext, useState, ReactNode } from 'react';

type DataType = 'global' | 'empresa';

interface DataContextType {
  dataType: DataType;
  setDataType: (type: DataType) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataType, setDataType] = useState<DataType>('global');

  return (
    <DataContext.Provider value={{ dataType, setDataType }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

