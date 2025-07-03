const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../../config");
const { serviceResponse } = require("../../../helpers/response");
const { CouponModel } = require("../../../models/coupons.model");
const { STP, pagination } = require("../../../utils");

exports.ADD = async (payload) => {
  const coupon = await STP.createCoupons(payload.discount);
  payload.code = coupon.id;
  await CouponModel.create(payload);
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, coupon);
};

exports.LIST = async (query) => {
  let { page, limit, search, order } = query;

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

  if (order === "latest") {
    sort.createdAt = -1;
  } else if (order === "oldest") {
    sort.createdAt = 1;
  } else {
    sort.createdAt = -1;
  }

  const offset = page === 1 ? 0 : limit * (page - 1);
  const response = await CouponModel.find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit);

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await CouponModel.countDocuments(findQuery),
        rows: response,
      },
      page,
      limit
    )
  );
};
