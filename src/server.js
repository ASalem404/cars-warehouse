const express = require("express");
const mongoose = require("mongoose");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const dotenv = require("dotenv");

const limiter = require("./middlewares/limitRequests");
const carsRouter = require("./routes/carsRouter");
const userRouter = require("./routes/userRouter");

const app = express();
const PORT = process.env.PORT || 8080;

dotenv.config({ path: `${__dirname}\\.env` });

// secure http requests
app.use(helmet());

// limit requests
app.use("/api", limiter);

// body parsing
app.use(express.json({ limit: "10kb" }));

// handle NoSQL injection
app.use(mongoSanitize());

// handle XSS
app.use(xss());

// handle parameters pollution
app.use(hpp());

app.use("/api/v1/cars", carsRouter);
app.use("/api/v1/users", userRouter);

const DB = process.env.DATABASE_HOST.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
