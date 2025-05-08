
import React from 'react';
import { ChevronDown } from 'lucide-react';

const WorkspaceSelector = () => {
  return (
    <div className="p-3 border-b border-gray-200">
      <button className="w-full flex items-center justify-between px-2 py-1 text-sm text-gray-600">
        <span>autommerce</span>
        <ChevronDown size={16} />
      </button>
    </div>
  );
};

export default WorkspaceSelector;
