export default (sequelize, DataTypes) => {
  const resolve = sequelize.define(
    "script_publish",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      handler_id: DataTypes.UUID,
      status: DataTypes.STRING,
      created_at: DataTypes.DATE,
      hostname: DataTypes.STRING,
      ual: DataTypes.STRING,
      assertion_id: DataTypes.STRING,
      start_timestamp: DataTypes.STRING,
      end_timestamp: DataTypes.STRING,
    },
    {}
  );
  resolve.associate = (models) => {
    // associations can be defined here
  };
  return resolve;
};
