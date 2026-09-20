export type Role = 'user' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due'
export type SubscriptionTier = 'monthly' | 'yearly'
export type DrawStatus = 'draft' | 'simulated' | 'published'
export type DrawMode = 'random' | 'algorithmic'
export type WinnerStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'paid'

export interface Profile {
  id: string
  email: string
  role: Role
  charity_id: string | null
  charity_contribution_percent: number
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string | null
  total_raised: number
  upcoming_events: any // jsonb
}

export interface Subscription {
  id: string
  profile_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  tier: SubscriptionTier
  current_period_end: string
  created_at: string
}

export interface Score {
  id: string
  profile_id: string
  score_value: number
  score_date: string
  created_at: string
}

export interface SystemConfig {
  key: string
  value: any // jsonb
}

export interface Draw {
  id: string
  period_start: string
  period_end: string
  status: DrawStatus
  mode: DrawMode
  winning_numbers: number[]
  total_pool: number
  tier_5_amount: number
  tier_4_amount: number
  tier_3_amount: number
  jackpot_rollover: number
  published_at: string | null
}

export interface DrawEntry {
  id: string
  draw_id: string
  profile_id: string
  score_numbers: number[]
}

export interface Winner {
  id: string
  draw_id: string
  profile_id: string
  match_count: number
  prize_amount: number
  proof_image_path: string | null
  verification_status: WinnerStatus
  payment_status: PaymentStatus
  admin_notes: string | null
}
