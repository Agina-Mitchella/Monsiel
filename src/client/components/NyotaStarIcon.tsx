import React from 'react';

interface NyotaStarIconProps {
  className?: string;
  size?: number;
  color?: string;
  accentColor?: string;
}

/**
 * Hand-drawn star illustration with loose outlines and botanical accents.
 * Flat, joyful, and imperfect, with no human or animal character.
 */
export const NyotaStarIcon: React.FC<NyotaStarIconProps> = ({
  className = '',
  size = 32,
  color = '#F4C542', // Sunny yellow
  accentColor = '#3E8E62' // Leaf green
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Nyota hand-drawn star symbol"
      role="img"
    >
      {/* Botanical sprig accent left */}
      <path
        d="M10 32C12 28 15 26 19 28M11 26C13 25 15 27 15 27"
        stroke={accentColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Botanical leaf accent right */}
      <path
        d="M38 30C36 26 33 25 29 27M37 24C35 24 33 26 33 26"
        stroke={accentColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hand-drawn imperfect five-point star with soft wobbles */}
      <path
        d="M24 7.5
           C24.8 12.2 26.2 16.5 28.5 18.8
           C32.8 19.4 37.2 19.8 40.5 22.5
           C37.5 25.2 34.0 27.8 32.5 31.8
           C33.8 36.2 34.6 40.8 31.5 42.8
           C27.5 40.5 24.2 38.0 24.0 38.0
           C23.5 38.0 20.2 40.5 16.5 42.8
           C13.5 40.8 14.2 36.2 15.5 31.8
           C14.0 27.8 10.5 25.2 7.5 22.5
           C10.8 19.8 15.2 19.4 19.5 18.8
           C21.8 16.5 23.2 12.2 24 7.5Z"
        fill={color}
        stroke="#D9A826"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Internal playful star twinkle sketch */}
      <circle cx="21" cy="22" r="1.5" fill="#FFFFFF" />
      <circle cx="27" cy="25" r="1.2" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
};
