// import dotenv from "dotenv";
// dotenv.config();

// const waveConfig = {
//   get CLIENT_ID() { return process.env.CLIENT_ID; },
//   get CLIENT_SECRET() { return process.env.CLIENT_SECRET; },
//   get REDIRECT_URL() { return process.env.REDIRECT_URL; },
//   AUTH_URL: "https://api.waveapps.com/oauth2/authorize/",
//   TOKEN_URL: "https://api.waveapps.com/oauth2/token/",
//   GQL_URL: "https://gql.waveapps.com/graphql/public",
//   SCOPES: "account:* business:read invoice:* customer:*",
//   CLIENT_ORIGIN: "http://localhost:5173",
// };

// export default waveConfig;

import dotenv from "dotenv";
dotenv.config();

const waveConfig = {
  get CLIENT_ID() { return process.env.CLIENT_ID; },
  get CLIENT_SECRET() { return process.env.CLIENT_SECRET; },
  get REDIRECT_URL() { return process.env.REDIRECT_URL; },
  AUTH_URL: "https://api.waveapps.com/oauth2/authorize/",
  TOKEN_URL: "https://api.waveapps.com/oauth2/token/",
  GQL_URL: "https://gql.waveapps.com/graphql/public",
  SCOPES: "account:* business:* customer:* invoice:* product:* sales_tax:* user:*",
  get CLIENT_ORIGIN() { return process.env.CLIENT_ORIGIN || "http://localhost:4012"; },
};

export default waveConfig;