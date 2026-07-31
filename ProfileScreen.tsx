import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Download, 
  ListMusic, 
  Heart, 
  History, 
  Bell, 
  Settings as SettingsIcon, 
  Info, 
  HelpCircle, 
  ChevronRight, 
  Moon, 
  Palette, 
  Wifi, 
  Trash2, 
  Zap, 
  Sliders, 
  Clock, 
  Database, 
  ShieldCheck, 
  Globe, 
  X, 
  Check, 
  Pencil,
  ArrowLeft
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  appSettings: AppSettings;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
  onClearCache: () => void;
  onNavigateTab: (tab: 'downloads' | 'library') => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  appSettings,
  onUpdateProfile,
  onUpdateSettings,
  onClearCache,
  onNavigateTab
}) => {
  // Modal / View States
  const [activeModal, setActiveModal] = useState<
    'none' | 'editProfile' | 'settings' | 'notifications' | 'about' | 'help' | 'favorites' | 'history'
  >('none');

  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [cacheClearedMsg, setCacheClearedMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Good Morning, ${userProfile.name}`;
    if (hour >= 12 && hour < 17) return `Good Afternoon, ${userProfile.name}`;
    if (hour >= 17 && hour < 22) return `Good Evening, ${userProfile.name}`;
    return `Good Night, ${userProfile.name}`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateProfile({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      email: editEmail
    });
    setActiveModal('none');
  };

  const handleClearCacheClick = () => {
    onClearCache();
    setCacheClearedMsg('Cache cleared successfully!');
    setTimeout(() => setCacheClearedMsg(''), 3000);
  };

  // Profile Menu Items List - Spotify Premium & Native Android Style
  const menuItems = [
    {
      id: 'editProfile',
      label: 'Edit Profile',
      icon: User,
      action: () => setActiveModal('editProfile')
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: Download,
      action: () => onNavigateTab('downloads')
    },
    {
      id: 'playlists',
      label: 'Playlists',
      icon: ListMusic,
      action: () => onNavigateTab('library')
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      action: () => setActiveModal('favorites')
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      action: () => setActiveModal('history')
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => setActiveModal('notifications')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      action: () => setActiveModal('settings')
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
      action: () => setActiveModal('about')
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      action: () => setActiveModal('help')
    }
  ];

  return (
    <div className={`flex-1 overflow-y-auto no-scrollbar p-6 pb-28 text-white min-h-full ${
      appSettings.themeMode === 'amoled' ? 'bg-black' : 'bg-zinc-950'
    }`}>
      {/* HEADER SECTION - Clean, Spotify Premium Style */}
      <div className="flex items-center gap-5 my-4">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-white/20 bg-zinc-800 shadow-xl">
            <img
              src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-black shadow-lg hover:scale-105 transition-transform"
            title="Upload Photo"
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-xs font-semibold text-emerald-400 tracking-wide block">
            {getGreeting()}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white truncate">
            {userProfile.name}
          </h1>

          <button
            onClick={() => setActiveModal('editProfile')}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="my-8 border-t border-white/10" />

      {/* MENU LIST - Spotify Premium Minimal Native Android List */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {activeModal === 'editProfile' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SETTINGS SUB-PAGE MODAL ================= */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white">Settings</h2>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Theme & Appearance */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1">Theme & Display</h3>
              <div className="bg-zinc-900/60 rounded-2xl border border-white/10 divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-sm font-semibold text-white block">Theme Mode</span>
                      <span className="text-xs text-zinc-400">Dark / Pitch Black AMOLED</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ themeMode: 'dark' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        appSettings.themeMode === 'dark' ? 'bg-emerald-500 text-black' : 'text-zinc-400'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ themeMode: 'amoled' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        appSettings.themeMode === 'amoled' ? 'bg-emerald-500 text-black' : 'text-zinc-400'
                      }`}
                    >
                      AMOLED
                    </button>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-sm font-semibold text-white block">Accent Color</span>
                      <span className="text-xs text-zinc-400">Spotify Emerald Accent</span>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
              </div>
            </div>

            {/* Audio & Playback */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1">Audio Quality</h3>
              <div className="bg-zinc-900/60 rounded-2xl border border-white/10 divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Streaming Quality</span>
                  </div>
                  <select
                    value={appSettings.streamingQuality}
                    onChange={(e) => onUpdateSettings({ streamingQuality: e.target.value as any })}
                    className="bg-black/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="320">320 kbps (Very High)</option>
                    <option value="256">256 kbps (High)</option>
                    <option value="128">128 kbps (Normal)</option>
                  </select>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Download Quality</span>
                  </div>
                  <select
                    value={appSettings.downloadQuality}
                    onChange={(e) => onUpdateSettings({ downloadQuality: e.target.value as any })}
                    className="bg-black/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="320">320 kbps (Extreme)</option>
                    <option value="256">256 kbps (Standard)</option>
                  </select>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Equalizer</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">Flat / Rock / Bass Boost</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Sleep Timer</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-semibold">Off</span>
                </div>
              </div>
            </div>

            {/* Cache & Storage */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1">Storage & Cache</h3>
              <div className="bg-zinc-900/60 rounded-2xl border border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-sm font-semibold text-white block">Clear Storage Cache</span>
                    <span className="text-xs text-zinc-400">Free local playback cache</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCacheClick}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Clear Cache
                </button>
              </div>
              {cacheClearedMsg && (
                <p className="text-xs text-emerald-400 font-medium text-center">{cacheClearedMsg}</p>
              )}
            </div>

            {/* Notifications inside Settings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1">Notifications</h3>
              <div className="bg-zinc-900/60 rounded-2xl border border-white/10 divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Master Notifications</span>
                  <input
                    type="checkbox"
                    checked={appSettings.masterNotifications}
                    onChange={(e) => onUpdateSettings({ masterNotifications: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
                {appSettings.masterNotifications && (
                  <>
                    <div className="p-4 flex items-center justify-between pl-8">
                      <span className="text-xs text-zinc-300">New Song Alerts</span>
                      <input
                        type="checkbox"
                        checked={appSettings.newSongsAlert}
                        onChange={(e) => onUpdateSettings({ newSongsAlert: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                    <div className="p-4 flex items-center justify-between pl-8">
                      <span className="text-xs text-zinc-300">Download Complete Alerts</span>
                      <input
                        type="checkbox"
                        checked={appSettings.downloadCompleteAlert}
                        onChange={(e) => onUpdateSettings({ downloadCompleteAlert: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Language, Backup & Privacy */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1">App & Privacy</h3>
              <div className="bg-zinc-900/60 rounded-2xl border border-white/10 divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Language</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-300">English</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Backup & Restore</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Privacy Policy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFICATIONS MODAL ================= */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
          <div className="p-4 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-zinc-900/60 rounded-2xl border border-white/10 divide-y divide-white/5">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white block">Push Notifications</span>
                  <span className="text-xs text-zinc-400">Master notification toggle</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.masterNotifications}
                  onChange={(e) => onUpdateSettings({ masterNotifications: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {appSettings.masterNotifications && (
                <>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-300">New Song Uploads</span>
                    <input
                      type="checkbox"
                      checked={appSettings.newSongsAlert}
                      onChange={(e) => onUpdateSettings({ newSongsAlert: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-300">Download Status Alerts</span>
                    <input
                      type="checkbox"
                      checked={appSettings.downloadCompleteAlert}
                      onChange={(e) => onUpdateSettings({ downloadCompleteAlert: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= FAVORITES MODAL ================= */}
      {activeModal === 'favorites' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
          <div className="p-4 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white">Your Favorites</h2>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 text-center py-16">
            <Heart className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Liked Songs & Favorites</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Tap the heart icon on any song to save it directly to your favorites list.
            </p>
          </div>
        </div>
      )}

      {/* ================= HISTORY MODAL ================= */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
          <div className="p-4 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white">Listening History</h2>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 text-center py-16">
            <History className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Recently Played</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Your playback history is automatically saved locally.
            </p>
          </div>
        </div>
      )}

      {/* ================= ABOUT MODAL ================= */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">About Music Player</h2>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center space-y-3 py-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black mx-auto flex items-center justify-center font-black text-2xl shadow-2xl">
              AP
            </div>
            <h3 className="text-xl font-bold text-white">Personal Music Player</h3>
            <p className="text-xs text-zinc-400">Version 3.4.0 • Android Release Build</p>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed pt-2">
              Private offline and cloud audio stream architecture engineered for Android.
            </p>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="w-full py-3 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* ================= HELP MODAL ================= */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Help & Support</h2>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 py-8">
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/10 space-y-1">
              <h4 className="text-sm font-semibold text-white">How do I download songs for offline mode?</h4>
              <p className="text-xs text-zinc-400">
                Tap the download icon next to any song in your library to save it to your device storage.
              </p>
            </div>

            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/10 space-y-1">
              <h4 className="text-sm font-semibold text-white">Does video audio play in background?</h4>
              <p className="text-xs text-zinc-400">
                Yes! Any uploaded video automatically streams audio only in the background with lock screen controls.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
