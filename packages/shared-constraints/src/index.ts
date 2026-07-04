import { UserRole } from '@spiced-dayhome/shared-types';

// ─── Validation Patterns ────────────────────────────────────────

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]{7,20}$/,
  POSTAL_CODE_CANADA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_UPPERCASE: /[A-Z]/,
  PASSWORD_LOWERCASE: /[a-z]/,
  PASSWORD_DIGIT: /\d/,
  PASSWORD_SPECIAL: /[!@#$%^&*(),.?":{}|<>_-]/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
} as const;

export const PASSWORD_RULES = {
  minLength: REGEX.PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
  errorMessage:
    'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
} as const;

// ─── Validation Limits ─────────────────────────────────────────

export const VALIDATION = {
  NAME_MIN: 1,
  NAME_MAX: 255,
  ADDRESS_MAX: 500,
  NOTES_MAX: 2000,
  PHONE_MIN: 7,
  PHONE_MAX: 20,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 200,
  FILE_SIZE_MAX: 10 * 1024 * 1024, // 10 MB
  FILE_ALLOWED_MIME: ['application/pdf', 'image/jpeg', 'image/png'] as readonly string[],
  AGE_GROUP_MIN_MONTHS: 0,
  AGE_GROUP_MAX_MONTHS: 240, // 20 years
  PIN_LENGTH: 4,
  PIN_MAX_LENGTH: 6,
} as const;

// ─── Role Hierarchy ─────────────────────────────────────────────

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ORG_ADMIN]: 80,
  [UserRole.ORG_MANAGER]: 60,
  [UserRole.BILLING_ONLY]: 50,
  [UserRole.DAYHOME_OWNER]: 40,
  [UserRole.EDUCATOR]: 20,
  [UserRole.PARENT]: 10,
  [UserRole.GOVERNMENT]: 5,
};

export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minimumRole] ?? 0);
}

// Roles that can manage other users (invite, update role, deactivate)
export const MANAGER_ROLES: readonly UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.ORG_MANAGER,
  UserRole.DAYHOME_OWNER,
];

// Roles with financial data access
export const FINANCE_ROLES: readonly UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.BILLING_ONLY,
  UserRole.DAYHOME_OWNER,
];

// Roles with child data access
export const CHILD_DATA_ROLES: readonly UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.ORG_MANAGER,
  UserRole.DAYHOME_OWNER,
  UserRole.EDUCATOR,
  UserRole.PARENT,
];

// ─── Pagination ─────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Province Ratios (Educator:Child) ───────────────────────────

export interface RatioRule {
  infant: number;
  toddler: number;
  preschool: number;
  schoolAge: number;
}

export const PROVINCE_RATIOS: Record<string, RatioRule> = {
  AB: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  BC: { infant: 4, toddler: 5, preschool: 8, schoolAge: 10 },
  MB: { infant: 4, toddler: 6, preschool: 8, schoolAge: 10 },
  NB: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  NL: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  NS: { infant: 4, toddler: 5, preschool: 8, schoolAge: 10 },
  ON: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  PE: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  QC: { infant: 4, toddler: 5, preschool: 8, schoolAge: 10 },
  SK: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  NT: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  NU: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
  YT: { infant: 3, toddler: 5, preschool: 8, schoolAge: 10 },
} as const;

// ─── Appointments / Status Machines ─────────────────────────────

export const DAYHOME_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  ACTIVE: ['SUSPENDED', 'CLOSED'],
  SUSPENDED: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
} as const;

export const INVOICE_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  DRAFT: ['FINALIZED', 'CANCELLED'],
  FINALIZED: ['SENT', 'CANCELLED'],
  SENT: ['PAID', 'OVERDUE', 'CANCELLED'],
  PAID: [],
  OVERDUE: ['PAID', 'CANCELLED'],
  CANCELLED: [],
} as const;

export const PTO_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
} as const;

// ─── Time Constants ─────────────────────────────────────────────

export const TIME = {
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  MILLISECONDS: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
  },
  EXPIRY: {
    INVITE_TOKEN: 48 * 60 * 60 * 1000, // 48 hours
    RESET_TOKEN: 60 * 60 * 1000, // 1 hour
    IDEMPOTENCY_KEY: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  ALERT_LEAD_DAYS: [60, 30, 14, 7] as readonly number[],
} as const;

// ─── Rate Limiting ──────────────────────────────────────────────

export const RATE_LIMIT = {
  GENERAL: { windowMs: 60 * 1000, max: 100 },
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 },
  UPLOAD: { windowMs: 60 * 1000, max: 10 },
  MESSAGE: { windowMs: 60 * 60 * 1000, max: 50 },
  ANNOUNCEMENT: { windowMs: 24 * 60 * 60 * 1000, max: 5 },
  MOBILE: { windowMs: 60 * 1000, max: 300 },
  INTAKE: { windowMs: 60 * 1000, max: 30 },
} as const;

// ─── Document Compliance ───────────────────────────────────────

export const REQUIRED_DOCUMENTS: readonly string[] = [
  'LICENSE',
  'INSURANCE',
  'FIRE_INSPECTION',
  'HEALTH_INSPECTION',
  'FIRST_AID_CERT',
];

export const COMPLIANCE_EXPIRY_THRESHOLD_DAYS = {
  GREEN: 60,
  AMBER: 14,
  RED: 0,
} as const;
