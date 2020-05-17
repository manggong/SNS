import * as express from "express";
import * as bcrypt from "bcrypt";
import * as passport from "passport";
import { isLoggedIn, isNotLoggedIn } from "./middleware";
import User from "../models/user";
import Post from "../models/post";

const router = express.Router();

router.get("/", isLoggedIn, (req, res) => {
  const user = req.user!.toJSON() as User;
  delete user.password;
  return res.json(user);
});

router.post("/", async (req, res, next) => {
  try {
    const exUser = await User.findOne({
      where: {
        userId: req.body.userid
      }
    });
    if (exUser) {
      return res.status(403).send(`이미 사용중인 ID 입니다`);
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      const newUser = await User.create({
        nickname: req.body.nickname,
        userId: req.body.userId,
        password: hashedPassword
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate(
    "local",
    (err: Error, user: User, info: { message: string }) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (info) {
        return res.status(401).send(info.message);
      }
      return req.logIn(user, async (loginErr: Error) => {
        try {
          if (loginErr) {
            return next(loginErr);
          } else {
            const fullUser = await User.findOne({
              where: { id: user.id },
              include: [
                {
                  model: Post,
                  as: "Posts",
                  attributes: ["id"]
                },
                {
                  model: User,
                  as: "Followings",
                  attributes: ["id"]
                },
                {
                  model: User,
                  as: "Followers",
                  attributes: ["id"]
                }
              ],
              attributes: {
                exclude: ["password"]
              }
            });
            return res.json(fullUser);
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
  );
});

router.post("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session!.destroy(() => {
    res.send(`Logout 됨.`);
  });
});

interface IUser extends User {
  PostCount: number;
  FollowingCount: number;
  FollowerCount: number;
}

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: parseInt(req.params.id, 10) },
      include: [
        {
          model: Post,
          as: "Posts",
          attributes: ["id"]
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"]
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"]
        }
      ],
      attributes: ["id", "nickname"]
    });
    if (!user) {
      return res.status(404).send(`no user`);
    } else {
      const jsonUser = user.toJson() as IUser;
      jsonUser.PostCount = jsonUser.Posts ? jsonUser.Posts.length : 0;
      jsonUser.FollowingCount = jsonUser.Followings
        ? jsonUser.Followings.length
        : 0;
      jsonUser.FollowerCount = jsonUser.Followers
        ? jsonUser.Followers.length
        : 0;
      return res.json(jsonUser);
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id/followings", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0
      }
    });
    if (!user) {
      return res.status(404).send(`no user`);
    } else {
      const follower = await user.getFollowings({
        attributes: ["id", "nickname"]
      });
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
});
