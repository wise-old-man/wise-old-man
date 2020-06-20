const playerService = require('../../modules/players/player.service');

module.exports = {
  name: 'UpdatePlayer',
  async handle({ data }) {
    const { username } = data;
    console.log('Executing UpdatePlayer job', username);
    await playerService.update(username);
  },
  onFail(jobData, error) {
    console.log('Failed UpdatePlayer job', jobData.username, error);
  },
  onSuccess(jobData) {
    console.log('Completed UpdatePlayer job', jobData.username);
  }
};
