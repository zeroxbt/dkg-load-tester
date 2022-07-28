import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import sequelizeConfig from "./config/sequelizeConfig.js";

async function loadModels() {
  const modelsDirectory = "./models";
  const sequelize = new Sequelize(
    sequelizeConfig.database,
    sequelizeConfig.username,
    sequelizeConfig.password,
    sequelizeConfig
  );
  const models = {};
  fs.readdirSync(modelsDirectory)
    .filter((file) => file.indexOf(".") !== 0 && file.slice(-3) === ".js")
    .forEach(async (file) => {
      const { default: f } = await import(`./models/${file}`);
      const model = f(sequelize, Sequelize.DataTypes);
      models[model.name] = model;
    });

  Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
  models.sequelize = sequelize;
  models.Sequelize = Sequelize;

  return models;
}

export { loadModels };
