import redisService from '../../../services/external/redis.service';

async function toggleUnderAttackMode(state: boolean) {
  await redisService.setValue('under_attack_mode', 'state', String(state));

  return state;
}

export { toggleUnderAttackMode };
