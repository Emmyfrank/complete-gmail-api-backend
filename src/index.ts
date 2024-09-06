import express from "express";
import cors from "cors";
import routes from "./routes/routes";
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
// const allowedOrigins = [
//   'http://localhost:5173'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//           callback(null, true);
//       } else {
//           callback(new Error('Not allowed by CORS'));
//       }
//   }
// }));

app.use("/api", routes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
