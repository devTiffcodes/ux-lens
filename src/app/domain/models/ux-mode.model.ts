export type UxMode = 'good' | 'poor';

export interface UxModeConfig {
  mode: UxMode;
  label: string;
  description: string;
}

export const UX_MODE_CONFIGS: Record<UxMode, UxModeConfig> = {
  good: {
    mode: 'good',
    label: 'Good UX mode',
    description: 'Calm layout, clear hierarchy, generous spacing'
  },
  poor: {
    mode: 'poor',
    label: 'Poor UX mode',
    description: 'Cluttered layout, small text, overwhelming elements'
  }
};
