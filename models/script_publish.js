module.exports = (sequelize, DataTypes) => {
  const publish = sequelize.define(
    "script_publish",
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
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {}
  );
  publish.associate = (models) => {
    // associations can be defined here
  };
  return publish;
};
