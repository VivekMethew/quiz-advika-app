const { CONSTANTS } = require("../../../config");
const { responseHelper } = require("../../../helpers");
const { calculateTime } = require("../../../utils/dateUtils");
const subscriptionService = require("./subscription.service");
const ExcelJS = require("exceljs");

exports.AddSubscriptions = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await subscriptionService.AddSubscriptions(body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const response = await subscriptionService.getSubscriptions();
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionsByModerator = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await subscriptionService.getSubscriptionsByModerator(
      user.id
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.viewSubscriptions = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await subscriptionService.viewSubscriptions(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.updateSubscriptions = async (req, res, next) => {
  try {
    const { body, params } = req;
    const response = await subscriptionService.updateSubscriptions(
      params.id,
      body
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.updateGoldPlanSubscriptions = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await subscriptionService.updateGoldPlanSubscriptions(
      params.id
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.addProductOnStripe = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await subscriptionService.addProductOnStripe(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteProductOnStripe = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await subscriptionService.deleteProductOnStripe(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteSubscriptions = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await subscriptionService.deleteSubscriptions(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.subsAnalytics = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await subscriptionService.subsAnalytics(query);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.subsDownloadExcelAnalytics = async (req, res, next) => {
  try {
    const { query } = req;
    const response =
      await subscriptionService.subsDownloadExcelAnalytics(query);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Define your headers
    worksheet.columns = [
      // Define column headers
      { header: "S.No", key: "index", width: 20 },
      { header: "User Name", key: "user_name", width: 30 },
      { header: "User Email", key: "user_email", width: 30 },
      { header: "Plan Name", key: "planName", width: 15 },
      { header: "Plan Duration Type", key: "planDurationType", width: 30 },
      { header: "Purchased Date", key: "purchasedDate", width: 30 },
      { header: "Expiry Date", key: "expiredOnDate", width: 30 },
      { header: "CreatedAt", key: "createdAt", width: 30 },
      { header: "Amount", key: "Amount", width: 20 },
    ];

    //new
    function capitalizeFirstLetter(string) {
      if (string && string.length > 0) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      } else {
        return ""; // or handle it in a way that makes sense for your application
      }
    }

    // Add data to the worksheet
    // response.data.forEach((item, index) => {
    //   const user_name = `${
    //     item?.userId?.fname ? capitalizeFirstLetter(item?.userId?.fname) : ""
    //   } ${item?.userId?.lname ? item?.userId?.lname : ""}`;

    //   const user_email = `${
    //     item?.userId?.email ? capitalizeFirstLetter(item?.userId?.email) : ""
    //   }`;

    //   worksheet.addRow({
    //     index: index + 1,
    //     type: capitalizeFirstLetter(item?.type),
    //     user_name,
    //     user_email,
    //     planName:
    //       item?.subsId?.name && capitalizeFirstLetter(item?.subsId?.name),
    //     planDurationType:
    //       item?.planId?.planDurationType &&
    //       capitalizeFirstLetter(item?.planId?.planDurationType),
    //     purchasedDate: calculateTime(item?.planId?.purchasedDate),
    //     expiredOnDate: calculateTime(item?.planId?.expiredOnDate),
    //     createdAt: calculateTime(item?.createdAt),
    //     Amount: item?.amount,
    //   });
    // });

    //new
    response.data.forEach((item, index) => {
      var amount;
      if (item.subscription.planDurationType == "monthly") {
        amount = item.subscription.subId.monthlyPrice;
      } else if (item.subscription.planDurationType == "annually") {
        amount = item.subscription.subId.annuallyPrice;
      } else {
        amount = 0;
      }

      if (
        item.subscription.subId.name === "trial" ||
        item.subscription.subId.name === "trail"
      ) {
        return; // Skip this iteration
      }
      const user_name = `${
        item?.fname ? capitalizeFirstLetter(item?.fname) : ""
      } ${item?.lname ? item?.lname : ""}`;

      const user_email = `${
        item?.email ? capitalizeFirstLetter(item?.email) : ""
      }`;

      worksheet.addRow({
        index: index + 1,
        //type: capitalizeFirstLetter(item?.type),
        user_name,
        user_email,
        planName:
          item?.subscription?.subId?.name &&
          capitalizeFirstLetter(item?.subscription?.subId?.name),
        planDurationType:
          item?.subscription?.planDurationType &&
          capitalizeFirstLetter(item?.subscription?.planDurationType),
        purchasedDate: calculateTime(item?.subscription?.purchasedDate),
        expiredOnDate: calculateTime(item?.subscription?.expiredOnDate),
        createdAt: calculateTime(item?.subscription?.createdAt),
        Amount: amount,
      });
      amount = 0;
    });
    //eod

    // Set up response headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales_${Date.now()}_report.xlsx`
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();

    // return responseHelper.successResponse(
    //   res,
    //   response.code,
    //   response.message,
    //   response.data
    // );
  } catch (error) {
    next(error);
  }
};

exports.test = async (req, res, next) => {
  try {
    const response = await subscriptionService.test();
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await subscriptionService.deleteOrder(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};
