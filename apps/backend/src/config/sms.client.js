import axios from "axios";
import smsConfig from "./sms.config.js";

const smsClient = axios.create({
    baseURL: smsConfig.baseUrl,
    headers: {
        Authorization: `Bearer ${smsConfig.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 15000,
});

export default smsClient;
