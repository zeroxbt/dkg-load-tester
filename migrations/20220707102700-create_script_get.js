module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("script_get", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      start_timestamp: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: Sequelize.literal("NOW()"),
      },
      end_timestamp: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: Sequelize.literal("NOW()"),
      },
      hostname: { allowNull: false, type: Sequelize.STRING },
      operation_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      ual: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      assertion_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      blockchain: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      errorType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("script_get");
  },
};
