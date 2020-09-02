import { Competition } from '../../database/models';
import jobs from './index';

export async function runTempParticipationJobs() {
  const competitions = await Competition.findAll({
    attributes: ['id', 'startsAt', 'endsAt'],
    order: [['createdAt', 'ASC']]
  });

  const baseDate = new Date();

  competitions.forEach((competition, index) => {
    const jobDate = new Date(baseDate.getTime() + 1000 + index * 60000);
    jobs.schedule('RevalidateParticipations', { competition }, jobDate);
  });
}
