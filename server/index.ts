import * as express from "express";

const app = express();

const prod: boolean = process.env.NODE_ENV === "production";

app.set("port", prod ? process.env.PORT : 8080);
app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(app.get("port"), () => {
  console.log(`server listening ${app.get("port")}`);
});
