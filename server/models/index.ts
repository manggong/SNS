import User, { associate as associateUser } from "./user";
import Comment, { associate as associateComment } from "./comment";
import Image, { associate as associateImage } from "./image";
import Hashtag, { associate as associateHashtag } from "./hashtag";
import Post, { associate as associatePost } from "./post";

export * from "./sequelize";

const db = {
  User,
  Comment,
  Hashtag,
  Image,
  Post,
};

export type dbType = typeof db;

associateUser(db);
associateComment(db);
associateImage(db);
associateHashtag(db);
associatePost(db);
