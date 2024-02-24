import { Prisma } from '@prisma/client';

// Some events need to be dispatched on this hook because (some) bulk creates depend
// on "skipDuplicates" which can't be easily predicted at the service level.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {}
