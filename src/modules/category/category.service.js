const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../config");
const { serviceResponse } = require("../../helpers/response");
const { Category } = require("../../models/category.model");
const { pagination } = require("../../utils");

exports.addCategory = async (payload) => {
  const colors = [
    CONSTANTS.CATEGORY.Green,
    CONSTANTS.CATEGORY.Blue,
    CONSTANTS.CATEGORY.Red,
    CONSTANTS.CATEGORY.Pink,
  ];

  const category = await Category.find({ isDeleted: null })
    .sort({ createdAt: -1 })
    .limit(1);

  const colorIndex = colors.findIndex((item) => item === category[0]?.color);

  if (colors.length === colorIndex + 1) {
    payload.color = colors[0];
  } else {
    payload.color = colors[colorIndex + 1];
  }

  const response = await Category.create(payload);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED, response);
};

exports.getList = async (query) => {
  let { page, limit, search, order, isTrending } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ isDeleted: null });

  let sort = {};
  if (!page && !limit) {
    page = 1;
    limit = 20;
  } else if (!page && limit) {
    page = 1;
    limit = parseInt(limit);
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  if (search) {
    findQuery["$and"].push({ name: { $regex: new RegExp(search, "i") } });
  }

  if (isTrending) {
    findQuery["$and"].push({ isTrending: isTrending });
  }

  if (order === "latest") {
    sort.createdAt = -1;
  } else if (order === "oldest") {
    sort.createdAt = 1;
  } else {
    sort.createdAt = -1;
  }

  const offset = page === 1 ? 0 : limit * (page - 1);
  const response = await Category.find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .select("name color isTrending status");

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await Category.countDocuments(findQuery),
        rows: response,
      },
      page,
      limit
    )
  );
};

exports.view = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ _id: id, isDeleted: null });
  const response = await Category.findOne(findQuery).select(
    "name color isTrending status"
  );
  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.update = async (id, payload) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ _id: id, isDeleted: null });
  const response = await Category.find(findQuery);
  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  await Category.findOneAndUpdate(findQuery, payload, { new: true });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.applyTrending = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ _id: id, isDeleted: null });
  const response = await Category.findOne(findQuery);
  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  if (response.isTrending) {
    await Category.findOneAndUpdate(
      findQuery,
      { isTrending: false },
      { new: true }
    );
  } else {
    await Category.findOneAndUpdate(
      findQuery,
      { isTrending: true },
      { new: true }
    );
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.isTrending ? "Remove successfully" : "Add successfully"
  );
};

exports.delete = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ _id: id, isDeleted: null });
  const response = await Category.find(findQuery);
  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  await Category.findOneAndUpdate(
    findQuery,
    { isDeleted: new Date() },
    { new: true }
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};
