exports.getPagingData = (data, page, limit) => {
  let response = {};
  const { count: totalItems, rows } = data;
  response.rows = rows;
  response.totalItems = totalItems;
  response.currentPage = page ? +page : 0;
  response.totalPages = Math.ceil(totalItems / limit);
  return response;
};

exports.getPagingDataRefs = (data, page, limit) => {
  const { count, rows } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(count / limit);

  return { count, rows, totalPages, currentPage };
};

exports.getPagingDataNew = (data, page, limit, label = "data") => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, [label]: rows, totalPages, currentPage };
};
