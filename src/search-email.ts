import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { getAttachments } from "./get-attachment";

export const searchEmails = async (auth: OAuth2Client, query: string) => {
  const gmail = google.gmail({ version: "v1", auth });

 
  const keywords = query.split(/\s+/).filter(Boolean);
  // const searchQuery = keywords.join(" AND ");
  // const searchQuery = `${keywords.join(" AND ")} AND has:attachment`; 
  const searchQuery = `${query} AND has:attachment`;

  const res = await gmail.users.messages.list({
    userId: "me",
    q: searchQuery,
  });

  const messages = res.data.messages || [];

  const emailsWithAttachments = await Promise.all(
    messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id!,
      });

      const attachments = await getAttachments(auth, msg.data.id!);

      if (attachments.length === 0) {
        return null;
      }

      const headers = msg.data.payload?.headers || [];
      const dateHeader = headers.find(header => header.name?.toLowerCase() === 'date');
      const date = dateHeader ? new Date(dateHeader.value || '') : null;

      return {
        id: msg.data.id,
        snippet: msg.data.snippet,
        payload: msg.data.payload,
        date: date ? date.toISOString() : null,
        attachments,
      };
    })
  );

  return emailsWithAttachments.filter(email => email !== null);
};

