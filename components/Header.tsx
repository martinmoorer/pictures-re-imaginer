
import React from 'react';
import { MagicWandIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
            <div className="flex items-center">
                <MagicWandIcon className="h-8 w-8 text-indigo-400" />
                <h1 className="ml-3 text-2xl font-bold text-white tracking-tight">AI Photo Magic</h1>
            </div>
        </div>
      </div>
    </header>
  );
};
