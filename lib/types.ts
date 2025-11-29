// Core Types for CAT FORM

export type FormStatus = "draft" | "published" | "archived"

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "date"
  | "time"
  | "datetime"
  | "slider"
  | "rating"
  | "matrix"
  | "geolocation"

export type DeviceType = "mobile" | "tablet" | "desktop"

export type AnalyticsEventType = "view" | "start" | "field_complete" | "abandon" | "submit"

export interface User {
  id: string
  email: string
  name: string | null
  created_at: number
  updated_at: number
}

export interface FormSettings {
  theme?: {
    backgroundColor?: string
    textColor?: string
    accentColor?: string
    font?: string
  }
  captcha?: {
    enabled: boolean
    provider: "astra" | "none"
  }
  limits?: {
    oneResponsePerUser: boolean
    closeAfterResponses?: number
    closeAfterDate?: number
  }
  notifications?: {
    email?: string
    telegram?: string
  }
  redirect?: {
    enabled: boolean
    url?: string
    message?: string
  }
}

export interface Form {
  id: string
  user_id: string
  title: string
  description: string | null
  settings: FormSettings
  status: FormStatus
  view_count: number
  response_count: number
  created_at: number
  updated_at: number
  published_at: number | null
}

export interface FieldValidation {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  minLength?: number
  maxLength?: number
}

export interface FieldSettings {
  conditional?: {
    fieldId: string
    operator: "equals" | "contains" | "gt" | "lt"
    value: string
  }
  score?: number // For quiz mode
}

export interface FormField {
  id: string
  form_id: string
  type: FieldType
  label: string
  description: string | null
  placeholder: string | null
  options: string[] | null
  validation: FieldValidation
  position: number
  settings: FieldSettings
  created_at: number
}

export interface Response {
  id: string
  form_id: string
  user_fingerprint: string | null
  ip_address: string | null
  user_agent: string | null
  country: string | null
  city: string | null
  device_type: DeviceType | null
  referrer: string | null
  completed: boolean
  completion_time: number | null
  created_at: number
}

export interface ResponseAnswer {
  id: string
  response_id: string
  field_id: string
  value: string | string[] | number | boolean
  created_at: number
}

export interface AnalyticsEvent {
  id: string
  form_id: string
  response_id: string | null
  event_type: AnalyticsEventType
  field_id: string | null
  metadata: Record<string, any>
  created_at: number
}

export interface Webhook {
  id: string
  form_id: string
  url: string
  events: string[]
  active: boolean
  secret: string | null
  created_at: number
}

// API Response Types
export interface FormWithFields extends Form {
  fields: FormField[]
}

export interface ResponseWithAnswers extends Response {
  answers: ResponseAnswer[]
}
