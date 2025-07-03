exports.generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

exports.generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};

exports.errorResponseMessage = (message, data = {}, ...options) => {
  let objData = { ...options };
  objData = objData[Object.keys(objData)];
  let response = { success: false, message: message, data: data };

  if (objData && objData.length > 0) {
    for (const d of objData) {
      response[`${Object.keys(d)[0]}`] = d[Object.keys(d)];
    }
  }
  return response;
};

exports.successResponseMessage = (message, data = {}, ...options) => {
  let objData = { ...options };
  objData = objData[Object.keys(objData)];
  let response = { success: true, message: message, data: data };

  if (objData && objData.length > 0) {
    for (const d of objData) {
      response[`${Object.keys(d)[0]}`] = d[Object.keys(d)];
    }
  }
  return response;
};
