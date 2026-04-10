'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Clock,
  Pencil,
  Loader2,
  Check,
  Key,
  LogOut,
  Camera,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  editor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  viewer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function ProfilePage() {
  const { user, logout } = useAuthStore();

  // Editable fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = { current: null as HTMLInputElement | null };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
 setAvatarPreview(reader.result as string);
      setAvatarUploading(false);
      toast.success('Profile picture updated');
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    toast.success('Profile picture removed');
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    // Simulate save — in a real app this would call an API
    await new Promise(resolve => setTimeout(resolve, 600));
    toast.success('Profile updated successfully');
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    toast.success('Password changed successfully');
    setIsChangingPassword(false);
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  if (!user) return null;

  const memberSince = user.createdAt instanceof Date
    ? user.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const lastLogin = user.lastLogin
    ? (user.lastLogin instanceof Date
        ? user.lastLogin.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))
    : 'Never';

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Account Information</h2>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-3 h-3" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Avatar section */}
        <div className="flex items-center gap-5 mb-6">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {/* Avatar circle */}
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className={cn(
                  'w-20 h-20 rounded-full object-cover border-2 border-border',
                  avatarUploading && 'opacity-50'
                )}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-border">
                {user.name.charAt(0)}
              </div>
            )}
            {/* Hover overlay */}
            {!avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
            {/* Uploading spinner */}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn('text-xs', roleColors[user.role])}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  user.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                )}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1.5"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <Camera className="w-3 h-3" />
                {avatarPreview ? 'Change' : 'Upload'}
              </Button>
              {avatarPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] gap-1.5 text-destructive hover:text-destructive"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
            <div className="space-y-1 flex-1 mr-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Full Name</Label>
              </div>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9 text-sm"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
            <div className="space-y-1 flex-1 mr-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Email Address</Label>
              </div>
              {isEditing ? (
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-9 text-sm"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Member Since</Label>
              </div>
              <p className="text-sm text-muted-foreground">{memberSince}</p>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Last Login</Label>
              </div>
              <p className="text-sm text-muted-foreground">{lastLogin}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Password</h2>
          </div>
          {!showPasswordChange && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowPasswordChange(true)}
            >
              Change Password
            </Button>
          )}
        </div>

        {showPasswordChange ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-9 text-sm"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9 text-sm"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-9 text-sm"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setShowPasswordChange(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Update Password
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your password was set when your account was created. For security, we recommend changing it regularly.
          </p>
        )}
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
        className="rounded-xl border border-destructive/20 bg-card p-6"
      >
        <h2 className="text-base font-semibold text-destructive mb-1">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-3 h-3" />
            Log Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
