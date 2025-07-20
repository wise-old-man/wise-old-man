export const MemberActivityType = {
  JOINED: 'joined',
  LEFT: 'left',
  CHANGED_ROLE: 'changed_role'
} as const;

export type MemberActivityType = (typeof MemberActivityType)[keyof typeof MemberActivityType];
