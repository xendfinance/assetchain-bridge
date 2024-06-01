export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
  created_at: number
}
export interface UserData {
  emails: Email[]
  institution: null
  person: Person
  phones: any[]
  uid: string
  verification_cases: VerificationCase[]
  verifications: Verification[]
}

export interface Email {
  address: string
}

export interface Person {
  date_of_birth?: Date
  full_name?: string
  identification_document_country?: string
  identification_document_date_of_expiry?: null
  identification_document_date_of_issue?: null
  identification_document_front_file?: string
  identification_document_number?: string
  identification_document_type?: string
  liveness?: boolean
  liveness_audit_best_file?: string
  liveness_audit_least_similar_file?: string
  liveness_audit_open_eyes_file?: string
  liveness_audit_quality1_file?: string
  liveness_audit_quality2_file?: string
  liveness_audit_quality3_file?: string
  residential_address_country?: string
  wallet_address?: string
  wallet_currency?: string
  wallet_check_reports?: any[]
  mrz?: { [key: string]: boolean | null }
}

export interface VerificationCase {
  created_at: string
  credential: string
  details?: Person
  id: string
  journey_completed: boolean
  level: string
  status: string
  updated_at: string
}

export interface Verification {
  details: Person
  level: string
  report: null
}
