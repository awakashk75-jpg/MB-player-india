import React, { useState } from 'react';
import { MediaItem } from '../types';
import { formatDuration, formatBytes } from '../utils/mediaUtils';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  Film,
  Music,
  Trash2,
  Play
} from 'lucide-react';

interface PrivateVaultModalProps {
  isLocked: boolean;
  vaultPin: string | null;
  vaultItems: MediaItem[];
  onUnlockVault: (enteredPin: string) => boolean;
  onSetVaultPin: (newPin: string) => void;
  onLockVault: () => void;
  onPlayMedia: (item: MediaItem) => void;
  onRemoveFromVault: (item: MediaItem) => void;
  onClose: () => void;
}

export const PrivateVaultModal: React.FC<PrivateVaultModalProps> = ({
  isLocked,
  vaultPin,
  vaultItems,
  onUnlockVault,
  onSetVaultPin,
  onLockVault,
  onPlayMedia,
  onRemoveFromVault,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSettingNewPin, setIsSettingNewPin] = useState(!vaultPin);
  const [newPinInput, setNewPinInput] = useState('');

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlockVault(pinInput)) {
      setPinInput('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN! Default PIN is 1234.');
    }
  };

  const handleSetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length < 4) {
      setErrorMsg('PIN must be at least 4 digits');
      return;
    }
    onSetVaultPin(newPinInput);
    setIsSettingNewPin(false);
    setNewPinInput('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101520] border border-purple-500/40 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              {isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                MB Secret Vault <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">256-Bit PIN Protected</span>
              </h2>
              <p className="text-xs text-gray-400">
                Hide private videos and audio files away from the public media gallery.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800"
          >
            Close
          </button>
        </div>

        {/* Locked Mode Input Screen */}
        {isLocked ? (
          <div className="py-6 space-y-6 text-center">
            {isSettingNewPin ? (
              <form onSubmit={handleSetPinSubmit} className="max-w-xs mx-auto space-y-4">
                <ShieldAlert className="w-12 h-12 text-purple-400 mx-auto" />
                <h3 className="font-bold text-white text-base">Set Private Vault PIN</h3>
                <p className="text-xs text-gray-400">
                  Create a 4-digit security code to safeguard your private folder.
                </p>
                <input
                  type="password"
                  maxLength={6}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full text-center tracking-[0.5em] text-xl font-bold bg-gray-900 border border-purple-500/50 rounded-2xl py-3 text-purple-300 focus:outline-none focus:border-purple-400"
                  autoFocus
                />
                {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/20"
                >
                  Save Security PIN
                </button>
              </form>
            ) : (
              <form onSubmit={handleUnlockSubmit} className="max-w-xs mx-auto space-y-4">
                <KeyRound className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
                <h3 className="font-bold text-white text-base">Enter Vault PIN</h3>
                <p className="text-xs text-gray-400">Default PIN: <span className="font-mono text-purple-300 font-bold">1234</span></p>

                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="• • • •"
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-gray-900 border border-purple-500/50 rounded-2xl py-3 text-purple-200 focus:outline-none focus:border-purple-400"
                  autoFocus
                />

                {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/30 hover:brightness-110"
                >
                  Unlock Secret Vault
                </button>

                <button
                  type="button"
                  onClick={() => setIsSettingNewPin(true)}
                  className="text-xs text-purple-400 hover:underline block mx-auto"
                >
                  Reset or Change PIN
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Unlocked Vault Contents Gallery */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
              <span className="text-xs font-bold text-purple-300">
                🔒 Protected Items ({vaultItems.length})
              </span>
              <button
                onClick={onLockVault}
                className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> Lock Vault Now
              </button>
            </div>

            {vaultItems.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Lock className="w-10 h-10 text-purple-400 mx-auto" />
                <p className="text-sm font-bold text-white">Your Vault is Empty</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Move videos from your library into the Private Vault using the video option menu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {vaultItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-900 border border-purple-500/30 rounded-2xl flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                        {item.type === 'video' ? <Film className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                        <p className="text-[10px] text-gray-400">{formatBytes(item.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onPlayMedia(item)}
                        className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                        title="Play"
                      >
                        <Play className="w-4 h-4 fill-cyan-300" />
                      </button>
                      <button
                        onClick={() => onRemoveFromVault(item)}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                        title="Move back to Public Library"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
