export const NameChangeStatus = {
  PENDING: 'pending',
  DENIED: 'denied',
  APPROVED: 'approved'
} as const;

export type NameChangeStatus = (typeof NameChangeStatus)[keyof typeof NameChangeStatus];
