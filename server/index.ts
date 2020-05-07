import * as express from "express";
import * as path from "path";
import * as cors from "cors";
import * as morgan from "morgan";
import * as cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import * as session from "express-session";
import * as hpp from "hpp";
import * as helmet from "helmet";
import * as passport from "passport";

import { sequelize } from "./models";

dotenv.config();
const app = express();

const prod: boolean = process.env.NODE_ENV === "production";

app.set("port", prod ? process.env.PORT : 8080);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("db ok");
  })
  .catch((err: Error) => {
    console.log(err);
  });

if (prod) {
  app.use(hpp());
  app.use(helmet());
  app.use(morgan("combined"));
  app.use(cors({ origin: /nodebird\.com$/, credentials: true }));
} else {
  app.use(hpp());
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(cors({ origin: true, credentials: true }));
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: true,
      secure: false,
      domain: prod ? ".nodebird.com" : undefined,
    },
    name: "rnbok",
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(app.get("port"), () => {
  console.log(`server listening ${app.get("port")}`);
});
