
import React from 'react';

const ProfilePage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-600 mb-2">First Name</label>
            <input type="text" placeholder="Enter your first name" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2">Last Name</label>
            <input type="text" placeholder="Enter your last name" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Email</label>
          <input type="email" placeholder="Enter your email" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        
        <button className="bg-[#F76D01] text-white py-2 px-4 rounded-md hover:bg-[#E65D00]">Save Changes</button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Password</h2>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Current Password</label>
          <input type="password" placeholder="Enter your current password" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">New Password</label>
          <input type="password" placeholder="Enter your new password" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Confirm New Password</label>
          <input type="password" placeholder="Confirm your new password" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        
        <button className="bg-[#F76D01] text-white py-2 px-4 rounded-md hover:bg-[#E65D00]">Update Password</button>
      </div>
    </div>
  );
};

export default ProfilePage;
