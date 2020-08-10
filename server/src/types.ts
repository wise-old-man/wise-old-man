export interface SkillMeta {
  skill: string;
  methods: Method[];
  bonuses: Bonus[];
}

export interface BossMeta {
  boss: string;
  rate: number;
}

export interface Method {
  startExp: number;
  rate: number;
  description: string;
}

export interface Bonus {
  originSkill: string;
  bonusSkill: string;
  startExp: number;
  endExp: number;
  end: boolean;
  ratio: number;
}

export interface Algorithm {
  type: string;
  skillMetas: SkillMeta[];
  bossMetas: BossMeta[];
  maxEHP: number;
  calculateEHB(killcounts: Killcounts): number;
  calculateEHP(experiences: Experiences): number;
  calculateTTM(experiences: Experiences): number;
  calculateSkillEHP(skill: string, experiences: Experiences): number;
  calculateBossEHB(boss: string, killcounts: Killcounts): number;
  calculateMaxEHP(): number;
}

export interface Experiences {
  [skill: string]: number;
}

export interface Killcounts {
  [boss: string]: number;
}

export enum BonusType {
  Start,
  End
}

export interface PaginationConfig {
  limit: number;
  offset: number;
}

export enum NameChangeStatus {
  PENDING,
  DENIED,
  APPROVED
}

export interface EventPeriod {
  hours?: number;
  minutes?: number;
}

export interface ProxiesConfig {
  port: number;
  username: string;
  password: string;
  hosts: string[];
}
