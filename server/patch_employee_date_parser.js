const fs = require("fs");

const file = "src/controllers/employeeController.js";
const source = fs.readFileSync(file, "utf8");

const startMarker = "    const parseDate = (v) => {";
const endMarker = "    };\r\n\r\n    const errors = [];";
const start = source.indexOf(startMarker);
const end = start < 0 ? -1 : source.indexOf(endMarker, start);

if (start < 0 || end < 0) {
  throw new Error("Could not locate the exact parseDate block. File unchanged.");
}

const replacement = `    const parseDate = (v) => {
      if (v === null || v === undefined || String(v).trim() === "") {
        return null;
      }

      if (typeof v === "number" && Number.isFinite(v)) {
        if (v < 1 || v > 2958465) return null;
        const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
        return Number.isNaN(d.getTime()) ? null : d;
      }

      const text = String(v).trim();
      let year, month, day;
      let match = text.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})$/);

      if (match) {
        [, year, month, day] = match.map(Number);
      } else {
        match = text.match(/^(\\d{1,2})[/-](\\d{1,2})[/-](\\d{4})$/);
        if (!match) return null;
        [, day, month, year] = match.map(Number);
      }

      const d = new Date(Date.UTC(year, month - 1, day));

      if (
        d.getUTCFullYear() !== year ||
        d.getUTCMonth() !== month - 1 ||
        d.getUTCDate() !== day
      ) {
        return null;
      }

      return d;
    };`;

const updated =
  source.slice(0, start) +
  replacement +
  source.slice(end + "    };".length);

fs.writeFileSync(file, updated, "utf8");
console.log("PASS: Replaced only the parseDate block.");
