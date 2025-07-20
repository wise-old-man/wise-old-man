/**
 * Prisma currently seems to ignore the @map() in enum declarations.
 *
 * So by declaring this enum in the schema file:
 *
 * enum NameChangeStatus {
 *    PENDING     @map('pending')
 *    DENIED      @map('denied')
 *    APPROVED    @map('approved')
 * }
 *
 * you would expect the prisma client to then generate the following object:
 *
 * const NameChangeStatus = {
 *    PENDING: 'pending',
 *    DENIED: 'denied',
 *    APPROVED: 'approved',
 * }
 *
 * but unfortunately, the mapping is only used for queries, and the actual esulting object is this:
 *
 * const NameChangeStatus = {
 *    PENDING: 'PENDING',
 *    DENIED: 'DENIED',
 *    APPROVED: 'APPROVED',
 * }
 *
 * And because I'd hate having to call enum values in lowercase, like:
 *    NameChangeStatus.pending
 *    Metric.king_black_dragon
 *    Period.day
 *
 * I'd rather do some mapping to ensure I have the best of both worlds,
 * lowercase database values, but with uppercase in code.
 * With the mappings below, we can now use prisma enums by calling them with uppercase, like:
 *
 *    NameChangeStatus.PENDING
 *    Metric.KING_BLACK_DRAGON
 *    Period.DAY
 *
 */

export const ActivityType = {
  JOINED: 'joined',
  LEFT: 'left',
  CHANGED_ROLE: 'changed_role'
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
