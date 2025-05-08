
export const getTypeColor = (type: string) => {
  switch(type) {
    case 'official':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'community':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'yours':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};
