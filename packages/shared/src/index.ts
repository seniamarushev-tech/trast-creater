export type Role = 'FAN' | 'ARTIST' | 'ADMIN';

export interface ArtistChartRow {
  id: number;
  name: string;
  trustScore: number;
  trustVelocity: number;
  trustRank: number;
}

export interface AllocationInput {
  artistId: number;
  tau: number;
}

export interface OnboardingResult {
  userId: number;
  expiresAt: string;
  tauAvailable: number;
}

export interface TrustSummary {
  expiresAt: string;
  tauRemaining: number;
  allocations: AllocationInput[];
}
