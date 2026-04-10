'use client';

import {
  User,
  Briefcase,
  Lightbulb,
  GraduationCap,
  FolderOpen,
  Code,
  Heart,
  BookOpen,
  Music,
  Camera,
  Gamepad2,
  Globe,
  Rocket,
  Palette,
  Sparkles,
  type LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  User,
  Briefcase,
  Lightbulb,
  GraduationCap,
  FolderOpen,
  Code,
  Heart,
  BookOpen,
  Music,
  Camera,
  Gamepad2,
  Globe,
  Rocket,
  Palette,
  Sparkles,
  Folder: FolderOpen,
};

interface SpaceIconProps extends LucideProps {
  name?: string;
  size?: number;
}

export function SpaceIcon({ name, size = 16, ...props }: SpaceIconProps) {
  if (!name) {
    return <FolderOpen size={size} {...props} />;
  }

  const IconComponent = iconMap[name];
  if (IconComponent) {
    return <IconComponent size={size} {...props} />;
  }

  // Fallback for unknown icon names - show first letter
  return (
    <span
      style={{ fontSize: size * 0.6 }}
      className="leading-none font-semibold"
    >
      {name.charAt(0)}
    </span>
  );
}
