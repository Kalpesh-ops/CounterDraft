import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const ScalesIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="4" y1="7" x2="20" y2="7" />
    <path d="M4 7L1 14H7L4 7Z" />
    <path d="M20 7L17 14H23L20 7Z" />
    <line x1="8" y1="21" x2="16" y2="21" />
  </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M4 2H15L20 7V22H4V2Z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="14" y2="16" />
  </svg>
);

export const CompareIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <rect x="2" y="4" width="9" height="16" />
    <rect x="13" y="4" width="9" height="16" />
    <line x1="5" y1="8" x2="8" y2="8" />
    <line x1="16" y1="8" x2="19" y2="8" />
    <line x1="5" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="19" y2="12" />
  </svg>
);

export const ShieldAlertIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M12 2L3 6V12C3 17.5 7 21.5 12 22C17 21.5 21 17.5 21 12V6L12 2Z" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <rect x="11.5" y="16" width="1" height="1" fill="currentColor" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="10" cy="10" r="7" />
    <line x1="15" y1="15" x2="21" y2="21" />
  </svg>
);

export const GavelIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M14 6L18 2L22 6L18 10L14 6Z" />
    <line x1="14" y1="6" x2="4" y2="16" />
    <rect x="2" y="20" width="8" height="2" />
  </svg>
);

export const ChecklistIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <line x1="4" y1="6" x2="6" y2="6" />
    <line x1="4" y1="12" x2="6" y2="12" />
    <line x1="4" y1="18" x2="6" y2="18" />
  </svg>
);

export const BriefcaseIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <rect x="2" y="7" width="20" height="14" />
    <path d="M16 7V4H8V7" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="12" y1="3" x2="12" y2="15" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <polygon points="3 4 21 4 14 13 14 20 10 18 10 13 3 4" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M2 3H11V20H2V3Z" />
    <path d="M13 3H22V20H13V3Z" />
  </svg>
);
