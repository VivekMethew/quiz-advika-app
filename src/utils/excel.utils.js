const ExcelJS = require("exceljs");
exports.createExcelSheet = () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");
  worksheet.columns = [
    // Define column headers
    { header: "Name", key: "name", width: 20 },
    { header: "Age", key: "age", width: 10 },
    { header: "Email", key: "email", width: 30 },
  ];

  // Add data to the worksheet
  data.forEach((item) => {
    worksheet.addRow({
      name: item.name,
      age: item.age,
      email: item.email,
    });
  });

  worksheet;
};
