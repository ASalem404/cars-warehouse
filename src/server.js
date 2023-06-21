const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const carsRouter = require("./routes/carsRouter");
const userRouter = require("./routes/userRouter");

const app = express();
const PORT = process.env.PORT || 8080;

dotenv.config({ path: `${__dirname}\\.env` });
console.log(`${__dirname}\\.env`);
app.use(express.json());
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
