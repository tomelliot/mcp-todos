import { pino } from "pino";
import * as os from "os";
import * as path from "path";
import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("log-dir", {
    type: "string",
    description: "Directory for log files",
    default: path.join(os.homedir(), ".claude", "filesystem", "logs"),
  })
  .parseSync();

const logDir = argv.logDir;
const logFile = path.join(logDir, "todos.log");

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const fileStream = fs.createWriteStream(logFile, { flags: "a" });

// Create the logger
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "error",
  },
  fileStream
);

logger.info(`pino started with log directory: ${logDir}`);
