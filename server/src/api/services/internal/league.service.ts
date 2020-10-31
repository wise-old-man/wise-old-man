import { LeaguePage } from '../../../database/models';

async function getLatestPage(): Promise<number> {
  const result = await LeaguePage.findOne({
    order: [['createdAt', 'DESC']]
  });

  return result ? result.pageIndex : -1;
}

async function updateLatestPage(newPageIndex: number) {
  await LeaguePage.create({ pageIndex: newPageIndex });
}

export { getLatestPage, updateLatestPage };
