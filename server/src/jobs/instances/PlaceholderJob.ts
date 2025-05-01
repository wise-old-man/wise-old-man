import { Job } from '../job.utils';

export class PlaceholderJob extends Job<unknown> {
  async execute() {}
}
