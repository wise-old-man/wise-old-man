import * as nameService from '../../services/internal/name.service';
import { Job } from '../index';

class ReviewNameChange implements Job {
  name: string;

  constructor() {
    this.name = 'ReviewNameChange';
  }

  async handle(data: any): Promise<void> {
    const { id } = data;
    await nameService.autoReview(id);
  }
}

export default new ReviewNameChange();
