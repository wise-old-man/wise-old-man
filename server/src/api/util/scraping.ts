import cheerio from 'cheerio';
import tableParser from 'cheerio-tableparser';


function getHiscoresTableNames(data) {
  const $ = cheerio.load(data);
  tableParser($);

  const tableData = $('table').parsetable(false, false, true);

  if (!tableData || tableData.length < 2) {
    return [];
  }

  return tableData[1];
}

export { getHiscoresTableNames };