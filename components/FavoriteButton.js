'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';

const STORAGE_KEY = 'tvsporrehberi:favorites';

function readFavorites() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function getFavoriteIds() {
  return typeof window === 'undefined' ? new Set() : readFavorites();
}

export default function FavoriteButton({ favoriteId, label, compact = false }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(readFavorites().has(favoriteId));
    sync();
    window.addEventListener('tvsporrehberi:favorites', sync);
    return () => window.removeEventListener('tvsporrehberi:favorites', sync);
  }, [favoriteId]);

  function toggle() {
    const favorites = readFavorites();
    if (favorites.has(favoriteId)) favorites.delete(favoriteId);
    else favorites.add(favoriteId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    setActive(favorites.has(favoriteId));
    window.dispatchEvent(new Event('tvsporrehberi:favorites'));
  }

  return (
    <button
      type="button"
      className={`favorite-button${active ? ' active' : ''}${compact ? ' compact' : ''}`}
      onClick={(event) => { event.stopPropagation(); toggle(); }}
      aria-pressed={active}
      aria-label={`${label} ${active ? t('common.unfollow') : t('common.follow')}`}
      title={active ? t('common.unfollow') : t('common.follow')}
    >
      <span aria-hidden="true">★</span>
    </button>
  );
}
