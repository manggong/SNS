import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import * as cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import * as session from "express-session";
import * as hpp from "hpp";

dotenv.config();
const app = express();

const prod: boolean = process.env.NODE_ENV === "production";

app.set("port", prod ? process.env.PORT : 8080);
app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(app.get("port"), () => {
  console.log(`server listening ${app.get("port")}`);
});
