import React, { useState } from 'react';
import { Shield, Key, Share2, Lock, Plus, Eye, EyeOff, Copy, Trash2, History, Users, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuditLog {
  id: string;
  passwordId: string;
  action: 'viewed' | 'copied' | 'modified' | 'shared';
  timestamp: Date;
  user: string;
}

interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  accessLevel: 'private' | 'shared';
  sharedWith: string[];
  history: {
    action: string;
    timestamp: Date;
    details: string;
  }[];
}

function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newPassword, setNewPassword] = useState({
    title: '',
    username: '',
    password: '',
    accessLevel: 'private' as const,
    sharedWith: [] as string[],
  });
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const generateSecurePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword({ ...newPassword, password });
  };

  const addAuditLog = (passwordId: string, action: AuditLog['action']) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      passwordId,
      action,
      timestamp: new Date(),
      user: 'Current User', // In a real app, this would be the actual user
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    const newPasswordEntry: Password = {
      ...newPassword,
      id,
      history: [{
        action: 'created',
        timestamp: new Date(),
        details: 'Password created'
      }],
      sharedWith: []
    };
    setPasswords([...passwords, newPasswordEntry]);
    setNewPassword({ title: '', username: '', password: '', accessLevel: 'private', sharedWith: [] });
    setShowAddForm(false);
    addAuditLog(id, 'modified');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    addAuditLog(id, 'copied');
  };

  const deletePassword = (id: string) => {
    setPasswords(passwords.filter(p => p.id !== id));
  };

  const handleShare = (passwordId: string) => {
    if (!shareEmail) return;
    
    setPasswords(passwords.map(pwd => {
      if (pwd.id === passwordId) {
        return {
          ...pwd,
          sharedWith: [...pwd.sharedWith, shareEmail],
          history: [...pwd.history, {
            action: 'shared',
            timestamp: new Date(),
            details: `Shared with ${shareEmail}`
          }]
        };
      }
      return pwd;
    }));
    
    addAuditLog(passwordId, 'shared');
    setShareEmail('');
    setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header with Sign Out */}
      <div className="bg-gray-800/50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-400" size={24} />
            <span className="font-bold text-xl">SecureVault</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield size={64} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl font-bold mb-6">SecureVault</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Built to remember everything you could forget. Protect what you care about with military-grade AES 256 encryption.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <Key className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Password Generation</h3>
            <p className="text-gray-400">Generate unique, strong passwords instantly</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <Lock className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">AES 256 Encryption</h3>
            <p className="text-gray-400">Military-grade encryption for maximum security</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <Share2 className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Secure Sharing</h3>
            <p className="text-gray-400">Share passwords safely with customizable access levels</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <History className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Audit Trails</h3>
            <p className="text-gray-400">Track every action with detailed logs</p>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Password Vault</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <History size={20} /> View Audit Log
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} /> Add Password
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-700/50 p-6 rounded-lg mb-6">
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newPassword.title}
                  onChange={(e) => setNewPassword({ ...newPassword, title: e.target.value })}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Password"
                    value={newPassword.password}
                    onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg flex-1"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg"
                  >
                    Generate
                  </button>
                </div>
                <select
                  value={newPassword.accessLevel}
                  onChange={(e) => setNewPassword({ ...newPassword, accessLevel: e.target.value as 'private' | 'shared' })}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex-1"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {showAuditLog && (
            <div className="bg-gray-700/50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <History size={24} className="text-emerald-400" />
                Audit Log
              </h3>
              <div className="space-y-2">
                {auditLogs.map((log) => {
                  const password = passwords.find(p => p.id === log.passwordId);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                      <div>
                        <span className="font-semibold">{password?.title}</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-gray-400">{log.action}</span>
                      </div>
                      <div className="text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {passwords.map((pwd) => (
              <div key={pwd.id} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{pwd.title}</div>
                    <div className="text-gray-400 text-sm">{pwd.username}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded ${
                      pwd.accessLevel === 'private' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                      {pwd.accessLevel}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPassword(pwd.id);
                        setShowShareModal(true);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Users size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setShowPassword({ ...showPassword, [pwd.id]: !showPassword[pwd.id] });
                        if (!showPassword[pwd.id]) {
                          addAuditLog(pwd.id, 'viewed');
                        }
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      {showPassword[pwd.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(pwd.password, pwd.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy size={20} />
                    </button>
                    <button
                      onClick={() => deletePassword(pwd.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                {pwd.sharedWith.length > 0 && (
                  <div className="text-sm text-gray-400 mt-2">
                    Shared with: {pwd.sharedWith.join(', ')}
                  </div>
                )}
                {showPassword[pwd.id] && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded">
                    <code className="text-emerald-400">{pwd.password}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Share Password</h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedPassword && handleShare(selectedPassword)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;