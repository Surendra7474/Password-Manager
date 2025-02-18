import React, { useState } from 'react';
import { Settings, LogOut, Key, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  onUpdateProfile: () => void;
  onChangePassword: () => void;
}

export default function UserMenu({ onUpdateProfile, onChangePassword }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <UserIcon size={20} className="text-emerald-400" />
        <span className="text-gray-200">{user?.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 shadow-lg py-1">
          <button
            onClick={() => {
              onUpdateProfile();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
          >
            <Settings size={16} />
            Update Profile
          </button>
          <button
            onClick={() => {
              onChangePassword();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
          >
            <Key size={16} />
            Change Password
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}