import * as express from "express";
import * as bcrypt from "bcrypt";
import * as passport from "passport";
import { isLoggedIn, isNotLoggedIn } from "./middleware";
import User from "../models/user";
import Post from "../models/post";
import Image from "../models/image";

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
      const followings = await user.getFollowings({
        attributes: ["id", "nickname"],
        limit: parseInt(req.query.limit, 10),
        offset: parseInt(req.query.offset, 10)
      });
      return res.json(followings);
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

router.get("/:id/followers", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0
      }
    });
    if (!user) {
      return res.status(404).send(`no user`);
    } else {
      const followers = await user.getFollowers({
        attributes: ["id", "nickname"],
        limit: parseInt(req.query.limit, 10),
        offset: parseInt(req.query.offset, 10)
      });
      return res.json(followers);
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

router.delete("/:id/follower", isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user!.id }
    });
    await me!.removeFollower(parseInt(req.params.id, 10));
    res.send(req.params.id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user!.id }
    });
    await me!.addFollowing(parseInt(req.params.id, 10));
    res.send(req.params.id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id/posts", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: {
        UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
        RetweetId: null
      },
      include: [
        {
          model: User,
          attributes: ["id", "nickname"]
        },
        {
          model: Image
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id"]
        }
      ]
    });
    res.json(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.patch("/nickname", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname
      },
      {
        where: { id: req.user!.id }
      }
    );
    res.send(req.body.nickname);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default router;
