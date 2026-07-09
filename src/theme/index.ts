export const Colors = {
  // Backgrounds
  bg0:    '#080B10',
  bg1:    '#0D1117',
  bg2:    '#131922',
  bg3:    '#192030',
  bg4:    '#1E2A3E',

  // Borders
  border:       '#1C2638',
  borderSubtle: '#111820',

  // Accent / brand
  accent:    '#00D4AA',
  accentDim: 'rgba(0,212,170,0.12)',

  // Semantic
  positive:     '#00C896',
  positiveGlow: 'rgba(0,200,150,0.15)',
  negative:     '#FF4D6A',
  negativeGlow: 'rgba(255,77,106,0.15)',
  warning:      '#F5A623',

  // Text hierarchy
  textPrimary:   '#E8EDF5',
  textSecondary: '#7A8AA0',
  textMuted:     '#3D5068',

  // Navigation
  tabActive:   '#00D4AA',
  tabInactive: '#3D5068',

  // Drawer
  drawerBg:     '#090E15',
  drawerActive: '#162030',
  drawerText:   '#C0CCD8',
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const FontSize = {
  xs:      10,
  sm:      12,
  md:      13,
  base:    14,
  lg:      16,
  xl:      18,
  xxl:     22,
  xxxl:    28,
  display: 36,
};

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
};

export const Radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 999,
};
