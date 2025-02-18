import React, { useState } from 'react';
import { Hash, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import bcrypt from 'bcryptjs';

interface VerifyPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerifyPinModal({ isOpen, onClose, onSuccess }: VerifyPinModalProps) {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Get the stored PIN hash
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('pin')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Verify the PIN
      const isValid = await bcrypt.compare(pin, profile.pin);

      // Log the attempt
      await supabase
        .from('pin_attempts')
        .insert([
          {
            user_id: user?.id,
            success: isValid
          }
        ]);

      if (!isValid) {
        setError('Incorrect PIN');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to verify PIN');
      console.error(err);
    } finally {
      setLoading(false);
      setPin('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Enter Your PIN</h2>

        {error && (
          <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-300">
              4-Digit PIN
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="pin"
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="block w-full pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-white"
                placeholder="••••"
              />
            </div>
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
              {loading ? 'Verifying...' : 'Verify PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}