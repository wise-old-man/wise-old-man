import { Job } from '../job.utils';

type UpdateGroupScoreJobPayload = { groupId: number };

export class UpdateGroupScoreJob extends Job<UpdateGroupScoreJobPayload> {
  async execute(payload: UpdateGroupScoreJobPayload) {
    console.log(this.name, payload.groupId);
  }
}
