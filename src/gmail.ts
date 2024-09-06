import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
export const TOKEN_PATH = path.join(__dirname, "../token.json");

const CREDENTIALS: {
  web: {
    client_id: string | undefined;
    project_id: string | undefined;
    auth_uri: string | undefined;
    token_uri: string | undefined;
    auth_provider_x509_cert_url: string | undefined;
    client_secret: string | undefined;
    redirect_uris: (string | undefined)[];
    javascript_origins: (string | undefined)[];
  }
} = {
  web: {
    client_id: process.env.CLIENT_ID,
    project_id: process.env.PROJECT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [process.env.REDIRECT_URI],
    javascript_origins: [process.env.JAVASCRIPT_ORIGIN],
  },
};

export const generateAuthToken = async (code: string): Promise<boolean> => {
  const credentials = CREDENTIALS;
  if (!credentials || !credentials.web) {
    throw new Error("Failed to load credentials from environment variables");
  }

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = await oAuth2Client.getToken(code);
    if (!token) {
      console.error("Failed to get token");
      return false;
    }

    oAuth2Client.setCredentials(token.tokens);
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token.tokens));
    console.log("Token stored to", TOKEN_PATH);
    
    return true;
  } catch (error) {
    console.error("Error getting token:", error);
    return false;
  }
};

export const authenticate = async (): Promise<OAuth2Client | string> => {
  const credentials = CREDENTIALS;
  if (!credentials || !credentials.web) {
    throw new Error("Failed to load credentials from environment variables");
  }

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = fs.readFileSync(TOKEN_PATH, "utf-8");
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    return authUrl;
  }
};
