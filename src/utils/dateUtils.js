const moment = require("moment");
const moment1 = require("moment-timezone");

exports.isResetDateMatched = (expiredOnDate, resetAt) => {
  const document = {
    expiredOnDate: new Date(expiredOnDate),
    resetAt: new Date(resetAt),
  };
  const expiredOnDateOnly = document.expiredOnDate.toISOString().split("T")[0];
  const resetAtDateOnly = document.resetAt.toISOString().split("T")[0];
  return expiredOnDateOnly === resetAtDateOnly;
};

exports.calculateTime = (inputDateStr) => {
  // Assuming the input date string is in UTC format
  const inputDate = new Date(inputDateStr);

  // Get current date
  const currentDate = new Date();

  // Set up date formats
  const timeFormat = { hour: "numeric", minute: "numeric" };
  const dateFormat = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  // Check if it's today, tomorrow, or more than one day ago
  if (
    inputDate.getUTCDate() === currentDate.getUTCDate() &&
    inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
    inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
  ) {
    // Today: Convert to AM/PM format
    // const ampmTime = inputDate.toLocaleTimeString("en-US", timeFormat);
    // return ampmTime;
    const formattedDate = inputDate.toLocaleDateString("en-GB", dateFormat);
    return formattedDate;
  } else if (
    inputDate.getUTCDate() === currentDate.getUTCDate() - 1 &&
    inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
    inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
  ) {
    // Tomorrow: Show "Yesterday"
    const formattedDate = inputDate.toLocaleDateString("en-GB", dateFormat);
    return formattedDate;
    //return "Yesterday";
  } else if (
    Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24)) > 1 &&
    Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24)) <= 7
  ) {
    const formattedDate = inputDate.toLocaleDateString("en-GB", dateFormat);
    return formattedDate;
    // const timeDifference = Math.floor(
    //   (currentDate - inputDate) / (1000 * 60 * 60 * 24)
    // );

    // const targetDate = new Date();
    // targetDate.setDate(currentDate.getDate() - timeDifference);

    // const daysOfWeek = [
    //   "Sunday",
    //   "Monday",
    //   "Tuesday",
    //   "Wednesday",
    //   "Thursday",
    //   "Friday",
    //   "Saturday",
    // ];
    // const targetDay = daysOfWeek[targetDate.getDay()];

    // return targetDay;
  } else {
    // More than 7 days ago: Show date in DD/MM/YYYY format
    const formattedDate = inputDate.toLocaleDateString("en-GB", dateFormat);
    return formattedDate;
  }
};

module.exports.generateStartTimeEnd = (
  startDateTime,
  duration,
  timezon = "Asia/Kolkata"
) => {
  let startISO, endISO;
  startISO = new Date(startDateTime);
  startISO = moment1(startISO).utc();
  endISO = startISO.clone().add(duration, "hours");
  return {
    startISO: startISO.toISOString(),
    endISO: endISO.toISOString(),
    timezon,
  };
};



module.exports.isEndTimeExceeded = (endTime) => {
  const currentTime = new Date();
  // Compare the end time with the current time
  if (endTime.getTime() < currentTime.getTime()) {
    return true; // End time has exceeded
  } else {
    return false; // End time has not exceeded
  }
};

module.exports.dateMustBeGreater = (startDateTime) => {
  let start = new Date(startDateTime);
  if (start > new Date()) {
    return true;
  } else {
    return false;
  }
};

module.exports.getDatainDDMMYY = (date) => {
  return `0${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

module.exports.getMonthinWords = (point) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${point.getDate()}-${monthNames[point.getMonth()]}-${point
    .getFullYear()
    .toString()
    .substr(-2)}`;
};

module.exports.getMonthinWordsMMYY = (point) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[point.getMonth()]}-${point
    .getFullYear()
    .toString()
    .substr(-2)}`;
};

module.exports.getUTCTimeStamp = () => {
  const now = new Date();
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );
};

module.exports.getUTCTimeStampWithoutTime = () => {
  const now = new Date();
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0,
    0,
    0,
    0
  );
};

module.exports.getUTCTimeStampFromDate = (date) => {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
};

module.exports.getUTCTimeStampFromDateWithoutTime = (date) => {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
    0
  );
};

module.exports.getMonthDigit = (month) => {
  switch (month) {
    case "Jan":
      return "01";
    case "Feb":
      return "02";
    case "Mar":
      return "03";
    case "Apr":
      return "04";
    case "May":
      return "05";
    case "Jun":
      return "06";
    case "Jul":
      return "07";
    case "Aug":
      return "08";
    case "Sep":
      return "09";
    case "Oct":
      return "10";
    case "Nov":
      return "11";
    case "Dec":
      return "12";
    default:
      return null;
  }
};

module.exports.getMonthName = (month) => {
  switch (month) {
    case "1":
    case "01":
    case 1:
      return "January";
    case "2":
    case "02":
    case 2:
      return "February";
    case "03":
    case "3":
    case 3:
      return "March";
    case "04":
    case "4":
    case 4:
      return "April";
    case "05":
    case "5":
    case 5:
      return "May";
    case "06":
    case "6":
    case 6:
      return "June";
    case "07":
    case "7":
    case 7:
      return "July";
    case "08":
    case "8":
    case 8:
      return "August";
    case "09":
    case "9":
    case 9:
      return "September";
    case "10":
    case 10:
      return "October";
    case "11":
    case 11:
      return "November";
    case "12":
    case 12:
      return "December";
    default:
      return null;
  }
};

module.exports.daysBetween = (date1, date2) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

module.exports.getMonthDays = (month) => {
  switch (String(month)) {
    case "Jan":
    case "1":
    case "01":
      return 31;
    case "Feb":
    case "2":
    case "02":
      return 29;
    case "Mar":
    case "3":
    case "03":
      return 31;
    case "Apr":
    case "4":
    case "04":
      return 30;
    case "May":
    case "5":
    case "05":
      return 31;
    case "Jun":
    case "6":
    case "06":
      return 30;
    case "Jul":
    case "7":
    case "07":
      return 31;
    case "Aug":
    case "8":
    case "08":
      return 31;
    case "Sep":
    case "9":
    case "09":
      return 30;
    case "Oct":
    case "10":
      return 31;
    case "Nov":
    case "11":
      return 30;
    case "Dec":
    case "12":
      return 31;
    default:
      return null;
  }
};

module.exports.compareStartDate = (date1) => {
  return new Date(date1) > new Date();
};

module.exports.compareIsEqualsDate = (date1, date2) => {
  return new Date(date2) === new Date(date1);
};

module.exports.compareDate = (date1, date2) => {
  let d1 = new Date(date1);
  let d2 = new Date(date2);
  if (d2.getTime() > d1.getTime()) {
    return true;
  } else {
    return false;
  }
  // let isValid =
  //   d2.toJSON().slice(0, 10).replace(/-/g, "/") >=
  //   d1.toJSON().slice(0, 10).replace(/-/g, "/");
  // if (isValid) {
  //   let isDateEquals =
  //     d2.toJSON().slice(0, 10).replace(/-/g, "/") ===
  //     d1.toJSON().slice(0, 10).replace(/-/g, "/");
  //   if (isDateEquals) {
  //     let isTimeValid = d2.toJSON().slice(11, 19) > d1.toJSON().slice(11, 19);
  //     if (isTimeValid) {
  //       return isTimeValid;
  //     } else {
  //       return isTimeValid;
  //     }
  //   } else {
  //     return isDateEquals;
  //   }
  // } else {
  //   return isValid;
  // }
  // // return new Date(date2) > new Date(date1);
};
module.exports.compareDate_1 = (date1, date2) => {
  return new Date(date2) >= new Date(date1);
};

module.exports.make2digit = (digit) => {
  return String(digit).padStart(2, "0");
};

module.exports.getCurrentDate = () => {
  return String(
    new Date().getFullYear() +
      "-" +
      self.make2digit(new Date().getMonth() + 1) +
      "-" +
      self.make2digit(new Date().getDate())
  );
};

module.exports.getNextDate = () => {
  let outDate = new Date();
  outDate = new Date(outDate.setDate(outDate.getDate() + 1));
  outDate =
    outDate.getFullYear() +
    "-" +
    self.make2digit(outDate.getMonth() + 1) +
    "-" +
    self.make2digit(outDate.getDate());
  return outDate;
};

module.exports.getPreviousDate = () => {
  let outDate = new Date();
  outDate = new Date(outDate.setDate(outDate.getDate() - 1));
  outDate =
    outDate.getFullYear() +
    "-" +
    self.make2digit(outDate.getMonth() + 1) +
    "-" +
    self.make2digit(outDate.getDate());
  return outDate;
};

module.exports.getCurrentDateInDDMMYY = (separator) => {
  if (separator === undefined) {
    separator = "-";
  }
  return String(
    self.make2digit(new Date().getDate()) +
      separator +
      self.make2digit(new Date().getMonth() + 1) +
      separator +
      new Date().getFullYear()
  );
};

module.exports.getCurrentDateInMMDDYY = (separator) => {
  if (separator === undefined) {
    separator = "-";
  }
  return String(
    new Date().getFullYear() +
      separator +
      self.make2digit(new Date().getMonth() + 1) +
      separator +
      self.make2digit(new Date().getDate())
  );
};

module.exports.convertTo24Hour = (time) => {
  const hours = parseInt(time.substr(0, 2));
  if (time.indexOf("am") !== -1 && hours === 12) {
    time = time.replace("12", "0");
  }
  if (time.indexOf("pm") !== -1 && hours < 12) {
    time = time.replace(hours, hours + 12);
  }
  return time.replace(/(am|pm)/, "");
};

module.exports.formatAMPM = (date) => {
  let hours = date.getHours();
  const minutes = self.make2digit(date.getMinutes());
  const AmPm = hours >= 12 ? "pm" : "am";
  hours = self.make2digit(hours % 12 || 12); // the hour '0' should be '12'
  return hours + ":" + minutes + " " + AmPm;
};

module.exports.getFilteredDates = (days, dates) => {
  const filteredDates = [];
  if (days.length === 0) {
    return [];
  } else {
    dates.forEach(function (date) {
      if (days.indexOf(new Date(date).getDay()) > -1) {
        filteredDates.push(date);
      }
    });
    return filteredDates;
  }
};

module.exports.getFilteredDatesFromObject = (days, dates, keyName) => {
  const filteredDates = [];
  if (days.length === 0) {
    return [];
  } else {
    dates.forEach(function (date) {
      if (days.indexOf(new Date(date[keyName]).getDay().toString()) > -1) {
        filteredDates.push(date);
      }
    });
    return filteredDates;
  }
};

module.exports.getDate = (requiredDate, format, separator) => {
  if (separator === undefined) {
    separator = "-";
  }
  if (format === undefined) {
    format = "y,m,d";
  }
  format = format.replace(/ /g, "");
  const date = requiredDate;
  if (date === undefined) {
    // can happen if the date is not there in the database and we are directly calling this without checking for null
    return date;
  }

  switch (format) {
    case "d,m,y":
      return (
        this.make2digit(date.getDate()) +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        date.getFullYear()
      );
    case "m,d,y":
      return (
        this.make2digit(date.getMonth() + 1) +
        separator +
        this.make2digit(date.getDate()) +
        separator +
        date.getFullYear()
      );
    case "y,m,d":
      return (
        date.getFullYear() +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        this.make2digit(date.getDate())
      );
    case "YY,MM,DD":
      return (
        date.getFullYear().toString().substr(2, 2) +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        this.make2digit(date.getDate())
      );
    case "YYYY,MM,DD":
      return (
        date.getFullYear() +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        this.make2digit(date.getDate())
      );
    default:
      return (
        this.make2digit(date.getDate()) +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        date.getFullYear()
      );
  }
};

module.exports.getUtcDate = (requiredDate, format, separator) => {
  if (separator === undefined) {
    separator = "-";
  }
  if (format === undefined) {
    format = "y,m,d";
  }
  format = format.replace(/ /g, "");
  const date = requiredDate;

  switch (format) {
    case "d,m,y":
      return (
        this.make2digit(parseInt(date.getDate())) +
        separator +
        this.make2digit(parseInt(date.getMonth() + 1)) +
        separator +
        date.getFullYear()
      );
    case "m,d,y":
      return (
        this.make2digit(parseInt(date.getMonth() + 1)) +
        separator +
        this.make2digit(parseInt(date.getUTCDate())) +
        separator +
        date.getFullYear()
      );
    case "y,m,d":
      return (
        date.getFullYear() +
        separator +
        this.make2digit(parseInt(date.getMonth() + 1)) +
        separator +
        this.make2digit(parseInt(date.getDate()))
      );
    case "YY,MM,DD":
      return (
        date.getFullYear().toString().substr(2, 2) +
        separator +
        this.make2digit(parseInt(date.getMonth() + 1)) +
        separator +
        this.make2digit(parseInt(date.getDate()))
      );
    default:
      return (
        this.make2digit(parseInt(date.getDate())) +
        separator +
        this.make2digit(parseInt(date.getMonth() + 1)) +
        separator +
        date.getFullYear()
      );
  }
};

module.exports.incrementDateBy = (count, requiredDate, format, saperator) => {
  if (saperator === undefined) {
    saperator = "-";
  }
  if (format === undefined) {
    format = "y,m,d";
  }
  format = format.replace(/ /g, "");
  let date = requiredDate;
  date = new Date(date.setDate(date.getDate() + count));

  switch (format) {
    case "d,m,y":
      return (
        self.make2digit(date.getDate()) +
        saperator +
        self.make2digit(date.getMonth() + 1) +
        saperator +
        date.getFullYear()
      );
    case "m,d,y":
      return (
        self.make2digit(date.getMonth() + 1) +
        saperator +
        self.make2digit(date.getDate()) +
        saperator +
        date.getFullYear()
      );
    case "y,m,d":
      return (
        date.getFullYear() +
        saperator +
        self.make2digit(date.getMonth() + 1) +
        saperator +
        self.make2digit(date.getDate())
      );
    default:
      return (
        self.make2digit(date.getDate()) +
        saperator +
        self.make2digit(date.getMonth() + 1) +
        saperator +
        date.getFullYear()
      );
  }
};

module.exports.decrementDateBy = (count, requiredDate, format, separator) => {
  if (separator === undefined) {
    separator = "-";
  }
  if (format === undefined) {
    format = "y,m,d";
  }
  format = format.replace(/ /g, "");
  let date = requiredDate;
  date = new Date(date.setDate(date.getDate() - count));

  switch (format) {
    case "d,m,y":
      return (
        this.make2digit(date.getDate()) +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        date.getFullYear()
      );
    case "m,d,y":
      return (
        this.make2digit(date.getMonth() + 1) +
        separator +
        this.make2digit(date.getDate()) +
        separator +
        date.getFullYear()
      );
    case "y,m,d":
      return (
        date.getFullYear() +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        this.make2digit(date.getDate())
      );
    default:
      return (
        this.make2digit(date.getDate()) +
        separator +
        this.make2digit(date.getMonth() + 1) +
        separator +
        date.getFullYear()
      );
  }
};

module.exports.addDays = (date, days) => {
  const dat = new Date(date);
  dat.setDate(dat.getDate() + days);
  return dat;
};

module.exports.validateDate = (dateVaue) => {
  return !isNaN(new Date(dateVaue).getTime());
};

module.exports.getDates = (startDate, stopDate) => {
  try {
    const dateArray = [];
    let currentDate = startDate;
    while (currentDate <= stopDate) {
      const formatedDate =
        currentDate.getFullYear() +
        "-" +
        self.make2digit(parseInt(currentDate.getMonth()) + 1) +
        "-" +
        self.make2digit(currentDate.getDate());
      dateArray.push(formatedDate);
      currentDate = self.addDays(1);
    }
    return dateArray;
  } catch (e) {
    global.logger.log(e);
  }
};

module.exports.convertISODateStringtoUTCDate = (effectiveDate) => {
  const utc = new Date(effectiveDate.toUTCString());
  let month = this.getMonthName(utc.getMonth() + 1);
  month = month.slice(0, 3);
  const hour =
    utc.getHours() === 0
      ? 12
      : utc.getHours() > 12
        ? utc.getHours() - 12
        : utc.getHours();
  const min = utc.getMinutes() < 10 ? "0" + utc.getMinutes() : utc.getMinutes();
  const sec = utc.getSeconds() < 10 ? "0" + utc.getSeconds() : utc.getSeconds();
  const AmPm = utc.getHours() < 12 ? "AM" : "PM";
  const time = hour + ":" + min + ":" + sec + " " + AmPm;
  const date = utc.getDate() < 10 ? "0" + utc.getDate() : utc.getDate();
  const dateTime = month + " " + date + ", " + utc.getFullYear() + " " + time;
  return dateTime;
};

module.exports.momentUTC = () => {
  const dateUTC = moment.utc().format("YYYY-MM-DD HH:mm:ss");

  const stillUtc = moment.utc(dateUTC).toDate();
  const local = moment(stillUtc).local().format("YYYY-MM-DD HH:mm:ss");
  return {
    dateUTC,
    local,
  };
};
