//initializing sequelize to make db calls through sequelize

const { Sequelize, DataTypes } = require("sequelize");
const logger = require("../utils/logger");

const dbConfig = require("../configs/dbConfig.js");
const { error } = require("winston");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST, // use the default port 3306 for mysql
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  define: {
    timestamps: false,
  },

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },

  logging: (msg) => logger.info(msg), // redirect logs to Winston
});

//making a db connection using sequelize
sequelize
  .authenticate()
  .then(() => {
    logger.info("database connected");
  })
  .catch((error) => {
    logger.error(`Error: database connection failed: ${error}`);
  });

const db = {};

db.sequelize = sequelize;

//utilizing DB Schema with sequelize
// db.users = require("./userModel")(sequelize, DataTypes);
db.users = require("./userV2")(sequelize);
// db.questions = require("./Questions")(sequelize, DataTypes, db.users); // Pass User model here
db.questions = require("./questionV2")(sequelize, db.users);
db.comments = require("./comment")(sequelize, db.users, db.questions);
db.userQuestionActions = require("./userQuestionAction")(sequelize, db.users, db.questions);
db.categories = require("./category")(sequelize);
db.questionCategory = require("./questionCategory")(sequelize, db.questions, db.categories);
// db.articles = require("./article")(sequelize, db.users);
// db.tags = require("./Tag")(sequelize);
// db.articleTags = require("./ArticleTag")(sequelize, db.articles, db.tags);
db.interests = require("./Interests")(sequelize, db.users, db.questions);

db.sequelize
  .sync({ force: false })
  .then(() => {
    logger.info("Syncing DB...");
  })
  .then(() => {
    logger.info("Syncing DB completed");
  })
  .catch((error) => {
    logger.error(`Error: syncing database failed: ${error}`);
  });

module.exports = db;
