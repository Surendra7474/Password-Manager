import React, { useState, useEffect } from 'react';
import { User, Phone, Hash, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import bcrypt from 'bcryptjs';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateProfileModal({ isOpen, onClose }: UpdateProfileModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadProfile();
    }
  }, [user, isOpen]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone_number')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name);
        setPhoneNumber(data.phone_number || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin && (pin.length !== 4 || !/^\d+$/.test(pin))) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const updates: any = {
        name,
        phone_number: phoneNumber,
        updated_at: new Date().toISOString(),
      };

      if (pin) {
        updates.pin = await bcrypt.hash(pin, 10);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Update Profile</h2>

        {error && (
          <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400">
            <AlertCircle size={20} />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-white"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-300">
              New 4-Digit PIN (optional)
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="block w-full pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-white"
                placeholder="••••"
              />
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Leave blank to keep your current PIN
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}