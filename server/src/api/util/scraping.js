const cheerio = require('cheerio');
const tableParser = require('cheerio-tableparser');

function getHiscoresTableNames(data) {
  const $ = cheerio.load(data);
  tableParser($);

  const tableData = $('table').parsetable(false, false, true);

  if (!tableData || tableData.length < 2) {
    return [];
  }

  return tableData[1];
}

exports.getHiscoresTableNames = getHiscoresTableNames;
