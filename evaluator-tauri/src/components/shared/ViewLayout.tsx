import React from 'react';

interface ViewLayoutProps {
  children: React.ReactNode;
}

export const ViewLayout: React.FC<ViewLayoutProps> = ({ children }) => {
  return (
    <div className="p-8 h-full flex flex-col">
      {children}
    </div>
  );
};
