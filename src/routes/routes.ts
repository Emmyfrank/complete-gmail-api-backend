import { Router } from "express";
import { google } from "googleapis";
import { authenticate, generateAuthToken } from "../gmail";
import { searchEmails } from "../search-email";
import { getAttachments } from "../get-attachment";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import { TOKEN_PATH } from "../gmail";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const code = req.body.code as string | undefined;
    if (!code || code === "") {
      return res.status(400).send("Bad Request: Code is required");
    }
    
    const generated = await generateAuthToken(code);
    res.json({
      success: generated,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/search", async (req, res) => {
  try {
    const auth = await authenticate();
    
    if (typeof auth === "string") {
      return res.status(401).send({
        error: "Credentials have expired. Please re-authenticate.",
        authUrl: auth,
      });
    }
    
    if (!(auth instanceof OAuth2Client)) {
      return res.status(500).send("Internal Server Error: Invalid auth object");
    }
    
    const query = req.query.q as string;
    
    if (query === "") {
      return res
        .status(400)
        .send("Bad Request: Query parameter 'q' is required");
    }
    
    const emails = await searchEmails(auth, query);
    
    const emailDetails = await Promise.all(
      emails.map(async (email) => {
        if (!email) {
          return null;
        }

        const attachments = await getAttachments(auth, email.id!);
        const sender =
          email.payload?.headers?.find((header) => header.name === "From")
            ?.value || "";
        const [name, emailAddress] = sender.split("<");
        
        return {
          id: email.id!,
          snippet: email.snippet!,
          name: name.trim(),
          email: emailAddress?.replace(">", "").trim(),
          attachments: attachments.map((att) => ({
            mimeType: att.mimeType,
            filename: att.filename,
            downloadUrl: `${req.protocol}://${req.get("host")}/api/download/${email.id}/${att.attachmentId}/${encodeURIComponent(att.filename || "")}`,
          })),
        };
      })
    );
    
  
    const filteredEmailDetails = emailDetails.filter((email) => email !== null);
    
    res.json(filteredEmailDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/download/:messageId/:attachmentId/:filename?",
  async (req, res) => {
    try {
      const auth = await authenticate();
      const { messageId, attachmentId, filename } = req.params;
      
      if (!(auth instanceof OAuth2Client)) {
        return res
          .status(500)
          .send("Internal Server Error: Invalid auth object");
      }
      
      const gmail = google.gmail({ version: "v1", auth });
      const attachment = await gmail.users.messages.attachments.get({
        userId: "me",
        messageId,
        id: attachmentId,
      });
      
      if (!attachment.data.data) {
        return res.status(404).send("Attachment not found");
      }
      
      const buffer = Buffer.from(attachment.data.data, "base64");
      
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
      const safeFilename = filename || `${timestamp}.pdf`;
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFilename}"`
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post('/logout',(req, res) => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
