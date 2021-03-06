import * as config from "config";
import { LogConfig } from "matrix-js-snippets";

interface IConfig {
    homeserverUrl: string;
    accessToken: string;

    targetRoomId: string;

    logging: LogConfig;
}

export default <IConfig>config;