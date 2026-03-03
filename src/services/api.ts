import axios from "axios";

export const api = axios.create({
  baseURL: "https://rdo.wtecc.com.br",
});

