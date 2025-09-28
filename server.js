import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import crypto from 'crypto';

import mqttClient from "./mqttClient.js";
import authRoutes from "./routes/authRoutes.js";
import controlRoutes from "./routes/controlRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import sensorDataRoutes from "./routes/sensorDataRoutes.js";
import { handleMQTTMessage } from "./utilsothers/parseSensorPayload.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

//  Middleware-uri
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

//  Middleware pentru sesiuni
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' && !process.env.DISABLE_HTTPS,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24h
  }
}));

//  Rute API
app.get("/", (req, res) => res.send("API is running"));
app.get("/api/test", (req, res) => res.json({ message: "API test working" }));

app.use("/api/auth", authRoutes);
app.use("/api/control", controlRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/sensor", sensorDataRoutes);

//  MQTT
mqttClient.on("message", handleMQTTMessage);

//  Pornire server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

//  Rută 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

//  Middleware global de eroare
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});



// // Configurare dotenv
// require('dotenv').config({ path: '.env' });

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware securizare
// app.use(helmet());
// app.disable('x-powered-by');

// // Middleware CORS
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? ['https://domeniul-tau.com']
//     : true,
//   credentials: true
// }));

// // Middleware body parser
// app.use(express.json());
// app.use(cookieParser());

// // Sesiuni
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'terces',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
//     maxAge: 24 * 60 * 60 * 1000
//   }
// }));

// // Rute API
// app.use("/api/auth", authRoutes);
// // ... alte rute

// // Rute speciale
// app.get("/", (req, res) => res.send("API is running"));
// app.get("/api/test", (req, res) => res.json({ message: "API test working" }));

// // 404 Handler
// app.use((req, res) => {
//   res.status(404).json({ error: "Not Found" });
// });

// // Error Handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     error: {
//       message: err.message || 'Internal Server Error',
//       ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//     }
//   });
// });

// // Conectare MQTT (dacă e cazul)
// initializeMQTT();

// // Pornire server
// app.listen(port, "0.0.0.0", () => {
//   console.log(`Server running on port ${port}`);
// });


