module.exports = (sequelize, DataTypes) => {
  const get = sequelize.define(
    "script_get",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      operation_id: DataTypes.UUID,
      status: DataTypes.STRING,
      created_at: DataTypes.DATE,
      hostname: DataTypes.STRING,
      ual: DataTypes.STRING,
      assertion_id: DataTypes.STRING,
      start_timestamp: DataTypes.STRING,
      end_timestamp: DataTypes.STRING,
      blockchain: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {}
  );
  get.associate = (models) => {
    // associations can be defined here
  };
  return get;
};
