const path = require("path");
exports.Base64Info = (base64Data) => {
  const base64String = base64Data.split(",")[1];
  const mimeType = base64Data.match(/^data:(.*);base64,/)[1];
  const byteSize = new TextEncoder().encode(base64String).byteLength;

  const fileExtension = path.extname(
    "file." + base64Data.split("/")[1].split(";")[0]
  );
  const filename =
    process.env.BUCKET_NAME + "__" + Date.now().toString() + fileExtension;

  return {
    filename,
    mimeType,
    size: byteSize,
    extname: fileExtension,
  };
};
