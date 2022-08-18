module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("script_get", "error", "errorMessage");
    await queryInterface.renameColumn(
      "script_publish",
      "error",
      "errorMessage"
    );
    await queryInterface.addColumn("script_get", "errorType", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("script_publish", "errorType", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.renameColumn("script_get", "errorMessage", "error");
    await queryInterface.renameColumn(
      "script_publish",
      "errorMessage",
      "error"
    );
    await queryInterface.removeColumn("script_get", "errorType");
    await queryInterface.removeColumn("script_publish", "errorType");
  },
};
