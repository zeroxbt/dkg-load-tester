module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("script_get", "error", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("script_publish", "error", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("script_get", "error");
    await queryInterface.removeColumn("script_publish", "error");
  },
};
