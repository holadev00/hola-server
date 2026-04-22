import moment from "moment";
import fs from "fs";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogOptions {
    service?: string;
    scope?: string;
}

function formatArg(arg: unknown): string {
    if (arg instanceof Error) {
        return arg.stack || arg.message;
    }
    if (typeof arg === "object") {
        try {
            return JSON.stringify(arg);
        } catch {
            return "[Unserializable Object]";
        }
    }
    return String(arg);
}

export function createLogger(
    { service = "App", scope = "-" }: LogOptions = {}
) {
    return (level: LogLevel, message: string, ...args: unknown[]) => {
        const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
        const formattedArgs = args.map(formatArg).join(" ");

        const logLine = `${timestamp} [${level}] [${service}:${scope}] ${message}${formattedArgs ? " " + formattedArgs : ""
            }`;

        fs.appendFileSync(`${__dirname}/../hola.log`, logLine + "\n");
        
        switch (level) {
            case "ERROR":
                console.error(logLine);
                break;
            case "WARN":
                console.warn(logLine);
                break;
            default:
                console.log(logLine);
        }
    };
}
