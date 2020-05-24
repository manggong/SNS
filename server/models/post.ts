import {
  Model,
  DataTypes,
  BelongsToManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyAddAssociationMixin
} from "sequelize";
import sequelize from "./sequelize";
import { dbType } from "./index";
import Hashtag from "./hashtag";
import Image from "./image";

class Post extends Model {
  public readonly id!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public addHashtags!: BelongsToManyAddAssociationMixin<Hashtag, number>;
  public addImages!: HasManyAddAssociationsMixin<Image, number>;
  public addImage!: HasManyAddAssociationMixin<Image, number>;
}

Post.init(
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "post",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci"
  }
);

export const associate = (db: dbType) => {
  db.Post.belongsTo(db.User);
  db.Post.hasMany(db.Comment);
  db.Post.hasMany(db.Image);
  db.Post.belongsTo(db.Post, { as: "Retweet" });
  db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
  db.Post.belongsToMany(db.User, { through: "Like", as: "Likers" });
};

export default Post;
