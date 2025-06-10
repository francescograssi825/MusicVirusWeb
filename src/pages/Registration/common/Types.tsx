export type EventDto = {
    id: string;
    name: string;
    description: string;
    artist: {
      id: string;
      name: string;
      email: string;
    };
    genres: string[]; // "ROCK", "POP"
    merchant: {
      
      id: string;
      merchantName: string;
      merchantAddress: string;
      merchantDescription: string;
      merchantOffers: string;
      email: string;
      
    };
    amount: number;
    creationDate: string;
    eventDate: string;
    endFundraisingDate: string;
    pictures: string[];
    sample: string[];
    eventState: string;
    creatorToken: string;
  };


  export type MerchantInfoDto = {
    id: string;
    merchantName: string;
    merchantAddress: string;
    merchantDescription: string;
    merchantOffers: string;
    email: string;
  };


import type { JSX } from 'react';
  // src/utils/genreUtils.tsx
import * as FaIcons from 'react-icons/fa';


export interface Genre {
  name: string;
  displayName: string;
  colorHex: string;
  iconName: string;
}

export const getGenreIcon = (iconName: string): JSX.Element => {
  const IconComponent = (FaIcons as any)[iconName] || FaIcons.FaMusic;
  return <IconComponent style={{ marginRight: 6 }} />;
};

export const getContrastingTextColor = (bgColor: string): string => {
  if (!bgColor.startsWith('#')) return 'white';

  const fullHex = bgColor.length === 4
    ? '#' + bgColor.slice(1).split('').map(c => c + c).join('')
    : bgColor;

  const r = parseInt(fullHex.substr(1, 2), 16);
  const g = parseInt(fullHex.substr(3, 2), 16);
  const b = parseInt(fullHex.substr(5, 2), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance > 186 ? 'black' : 'white';
};

export const getGenreStyles = (colorHex: string, isSelected: boolean) => {
  return {
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    backgroundColor: colorHex,
    color: getContrastingTextColor(colorHex),
    border: `2px solid ${isSelected ? '#000' : 'transparent'}`,
    fontWeight: isSelected ? 'bold' : 'normal',
    boxShadow: isSelected ? '0 0 5px rgba(0,0,0,0.3)' : undefined,
  };
};

export const genreGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '8px',
  marginTop: '8px',
};