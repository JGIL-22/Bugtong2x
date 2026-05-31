import React, { useState } from 'react';
import { avatars } from '../data/gamedata';
import clsx from 'clsx';
import { getAvatarUrl } from '../utils/avatarUtils';

interface AvatarImageProps {
  avatarId: string;
  className?: string;
}

export default function AvatarImage({ avatarId, className }: AvatarImageProps) {
  const [error, setError] = useState(false);
  const avatarObj = avatars.find(a => a.id === avatarId) || avatars[0];

  // If local image fails to load, fallback to DiceBear.
  const imageSrc = error ? getAvatarUrl(avatarId) : `/avatars/${avatarObj.id}.png`;

  return (
    <img 
      src={imageSrc}
      alt={avatarObj.name}
      onError={() => setError(true)}
      className={clsx("rounded-full bg-amber-50 object-cover", className)}
    />
  );
}
