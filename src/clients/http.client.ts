import axios from "axios";

export const httpClient = axios.create({
  timeout: 5000,
  headers: {
    Accept: "application/json",
  },
});
