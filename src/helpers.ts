import extIP from "external-ip";
import path from "path";
import speedTest from "speedtest-net";
import { Data } from "speedtest-net";
import { config as dotenvConfig } from "dotenv";

import { EnvConfig } from "./contracts";
import { NodeSettings } from "@noia-network/node-settings";

export namespace Helpers {
    export function getStorageDir(settings: NodeSettings): string {
        const settingsStorageDir = settings.getScope("storage").get("dir");
        const storageDir = settingsStorageDir != null ? settingsStorageDir : path.join(settings.get("userDataPath"), "storage");
        return storageDir;
    }

    export async function getSpeedTest(): Promise<Data> {
        return new Promise<Data>((resolve, reject) => {
            const test = speedTest({
                maxTime: 5 * 1000
            });
            test.on("data", data => {
                resolve(data);
            });
            test.on("error", (error: Error) => {
                reject(error);
            });
        });
    }

    export function getConfig(): EnvConfig {
        const dotenv = dotenvConfig({ path: path.resolve(process.cwd(), ".env") });
        if (dotenv.error) {
            const error: NodeJS.ErrnoException = dotenv.error;
            // If file does not exist, do nothing.
            if (error.code !== "ENOENT") {
                throw new Error("Failed to parse .env configuration file.");
            }
        }
        return dotenv.parsed != null ? dotenv.parsed : {};
    }

    export function randomString(len: number = 5): string {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < len; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    export async function getIpPromise(): Promise<string> {
        const getIP = extIP({
            replace: true,
            services: ["http://icanhazip.com/", "http://ident.me/", "http://ifconfig.co/x-real-ip", "http://ifconfig.io/ip"],
            timeout: 600,
            getIP: "parallel"
        });
        return new Promise<string>((resolve, reject) => {
            getIP((err: Error, ip: string) => {
                if (err) {
                    reject(err);
                }
                resolve(ip);
            });
        });
    }

    export function webSocketCloseCodeToReason(code: number | string): string {
        // Source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent.
        switch (code) {
            case 1000:
                return "Normal closure.";
            case 1006:
                return "Abnormal closure.";
            case 1008:
                return "Protocol error.";
            case 1012:
                return "Service is restarting.";
            default:
                return `Unspecified connection closure reason, code=${code}.`;
        }
    }
}
