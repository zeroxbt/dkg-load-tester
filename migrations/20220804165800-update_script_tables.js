module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("script_resolve", "script_get");
    await queryInterface.renameColumn(
      "script_get",
      "handler_id",
      "operation_id"
    );
    await queryInterface.renameColumn(
      "script_publish",
      "handler_id",
      "operation_id"
    );
    await queryInterface.addColumn("script_get", "blockchain", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn("script_publish", "blockchain", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("script_publish", "blockchain");
    await queryInterface.removeColumn("script_get", "blockchain");
    await queryInterface.renameColumn(
      "script_publish",
      "operation_id",
      "handler_id"
    );
    await queryInterface.renameColumn(
      "script_get",
      "operation_id",
      "handler_id"
    );
    await queryInterface.renameTable("script_get", "script_resolve");
  },
};
