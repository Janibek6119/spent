import fs from "fs";

const filePath = "example.log";

const fmtDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} UTC`;
};

const currentDateWellFormatted = fmtDate(new Date());

if (fs.existsSync(filePath)) {
  const logEntry = `${currentDateWellFormatted} | SCRIPT RUN\n`;
  fs.appendFileSync(filePath, logEntry);
} else {
  const logEntry = `${currentDateWellFormatted} | SCRIPT FIRST RUN\n`;
  fs.writeFileSync(filePath, logEntry);
}
