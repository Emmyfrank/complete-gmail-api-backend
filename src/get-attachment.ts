import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export const getAttachments = async (auth: OAuth2Client, messageId: string) => {
  const gmail = google.gmail({ version: "v1", auth });
  const message = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  const parts = message.data.payload?.parts || [];

  const attachments = parts
    .filter((part) => part.filename && part.body?.attachmentId)
    .map((part) => ({
      filename: part.filename,
      mimeType: part.mimeType,
      attachmentId: part.body?.attachmentId,
    }));

  return attachments;
};
