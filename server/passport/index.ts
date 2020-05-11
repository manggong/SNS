import * as passport from "passport";
import User from "../models/user";
import { AsyncLocalStorage } from "async_hooks";

export default () => {
  // 로그인 시 한번 실행
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  // 요청마다 실행
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await User.findOne({
        where: { id }
      });
      return done(null, user);
    } catch (err) {
      console.log(err);
      return done(err);
    }
  });

  local();
};
