import axios from "axios";
import payHeroConfig from "./payhero.config.js";

const payHeroClient = axios.create({
    baseURL: payHeroConfig.baseUrl,

    auth: {
        username: payHeroConfig.username,
        password: payHeroConfig.password,
    },

    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },

    timeout: 15000,
});

export default payHeroClient;
