export interface Pagination {
  limit: number;
  offset: number;
}

export interface EventPeriodDelay {
  hours?: number;
  minutes?: number;
}

export interface MigratedGroupInfo {
  members: string[];
  leaders?: string[];
  name?: string;
}
