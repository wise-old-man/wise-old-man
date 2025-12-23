const ErrorMessageMap = {
  CLAN_CHAT_HAS_INVALID_CHARACTERS: `Invalid 'clanChat'. Cannot contain special characters`,
  COMPETITION_DATES_IN_THE_PAST: `Start and end dates must be in the future`,
  COMPETITION_NOT_FOUND: `Competition not found`,
  COMPETITION_START_DATE_AFTER_END_DATE: `Start date must be before the end date`,
  COMPETITION_TYPE_CANNOT_BE_CHANGED: `The competition type cannot be changed`,
  DUPLICATE_TEAM_NAMES_FOUND: `Duplicate team names found`,
  DUPLICATE_USERNAMES_FOUND: `Duplicate usernames found`,
  ENDPOINT_NOT_FOUND: `Endpoint not found`,
  FAILED_TO_LOAD_HISCORES: `Failed to load the hiscores`,
  GROUP_NAME_ALREADY_EXISTS: `Group name already exists`,
  GROUP_NOT_FOUND: `Group not found`,
  GROUP_NOT_PATRON: `Group is not a patron group (cannot add images or links)`,
  HISCORES_SERVICE_UNAVAILABLE: `Jagex Hiscores Service is unavailable`,
  HISCORES_UNEXPECTED_ERROR: `Hiscores connection refused`,
  HISCORES_USERNAME_NOT_FOUND: `Player not found on the hiscores`,
  IMAGES_MUST_BE_INTERNALLY_HOSTED: `Cannot upload images from external sources - Please upload an image via the website`,
  INCORRECT_ADMIN_PASSWORD: `Incorrect admin password`,
  INCORRECT_GROUP_VERIFICATION_CODE: `Incorrect group verification code`,
  INCORRECT_VERIFICATION_CODE: `Incorrect verification code`,
  INVALID_USERNAME: `Invalid username`,
  INVALID_USERNAMES_FOUND: `Invalid player usernames found`,
  METRICS_MUST_BE_OF_SAME_TYPE: `All metrics must be of the same type`,
  MISSING_ADMIN_PASSWORD: `Required parameter 'adminPassword' is undefined`,
  MISSING_GROUP_VERIFICATION_CODE: `Required parameter 'groupVerificationCode' is undefined`,
  MISSING_VERIFICATION_CODE: `Required parameter 'verificationCode' is undefined`,
  NAME_CHANGE_NOT_FOUND: `Name change not found`,
  NO_SNAPSHOTS_TO_DELETE: `No snapshots found to delete`,
  NOTHING_TO_UPDATE: `Nothing to update`,
  OLD_STATS_NOT_FOUND: `Old stats for this name change could not be found`,
  OPTED_OUT_PARTICIPANTS_FOUND: `One or more participants have opted out of joining competitions`,
  OPTED_OUT_MEMBERS_FOUND: `One or more members have opted out of joining groups`,
  PARTICIPANTS_AND_GROUP_MUTUALLY_EXCLUSIVE: `Properties "participants" and "groupId" are mutually exclusive`,
  PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE: `Properties "participants" and "teams" are mutually exclusive`,
  PLAYER_IS_ARCHIVED: `Player is archived`,
  PLAYER_IS_BLOCKED: `Player has been blocked, please contact us on Discord for more information`,
  PLAYER_IS_FLAGGED: `Player is flagged`,
  PLAYER_IS_RATE_LIMITED: `Player was updated too recently`,
  PLAYER_NOT_FOUND: 'Player not found',
  PLAYER_OPTED_OUT: `Player has opted out of tracking. If this is your account and you want to opt back in, contact us on Discord`,
  ROLE_ORDER_MUST_HAVE_UNIQUE_INDEXES: `Role Order must contain unique indexes for each role`,
  ROLE_ORDER_MUST_HAVE_UNIQUE_ROLES: `Role Order must contain unique roles`,
  RUNELITE_NAME_CHANGE_DETECTED: `Name change detected (RuneLite)`,
  VALIDATION_ERROR: `Validation error`
} as const;

type ErrorCode = keyof typeof ErrorMessageMap;

interface ErrorParams {
  code: ErrorCode;
  subError?: unknown;
  message?: string;
  data?: unknown;
}

abstract class APIError extends Error {
  abstract statusCode: number;

  code: ErrorCode;
  data: unknown;
  subError: unknown;

  constructor({ message, code, data, subError }: ErrorParams) {
    super(message ?? ErrorMessageMap[code] ?? 'Unknown error');

    this.code = code;
    this.data = data;
    this.subError = subError;
    this.name = new.target.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RateLimitErrorZ extends APIError {
  statusCode = 429;
}

export class ForbiddenErrorZ extends APIError {
  statusCode = 403;
}

export class BadRequestErrorZ extends APIError {
  statusCode = 400;
}

export class ConflictErrorZ extends APIError {
  statusCode = 409;
}

export class NotFoundErrorZ extends APIError {
  statusCode = 404;
}

export class ServerErrorZ extends APIError {
  statusCode = 500;
}

export class ServiceUnavailableError extends APIError {
  statusCode = 503;
}

export class BadRequestError extends Error {
  message: string;
  name: string;
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.message = message;
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.data = data;
  }
}

export class ConflictRequestError extends Error {
  message: string;
  name: string;
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.message = message;
    this.name = 'ConflictRequestError';
    this.statusCode = 409;
    this.data = data;
  }
}

export class ForbiddenError extends Error {
  message: string;
  name: string;
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.message = message;
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.data = data;
  }
}

export class NotFoundError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class RateLimitError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

export class ServerError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'ServerError';
    this.statusCode = 500;
  }
}
