
import React from 'react';
import { Plus } from 'lucide-react';

const UpgradeButton = () => {
  return (
    <div className="p-4 border-t border-gray-200">
      <button className="w-full flex items-center justify-center gap-2 bg-[#F76D01] hover:bg-[#e65d00] text-white py-2 rounded-md">
        <Plus size={16} />
        <span>Upgrade now</span>
      </button>
    </div>
  );
};

export default UpgradeButton;
