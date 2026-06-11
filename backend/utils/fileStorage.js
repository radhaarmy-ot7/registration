const fs = require("fs");
const path = require("path");

const readData = (fileName) => {
  const filePath = path.join(__dirname, "../data", fileName);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
  }

  const rawData = fs.readFileSync(filePath, "utf8");

  return JSON.parse(rawData);
};

const writeData = (fileName, data) => {
  const filePath = path.join(__dirname, "../data", fileName);

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
};

module.exports = {
  readData,
  writeData,
};