const loadModels = require("../util/repository-service.js");

class Repository {
  async initialize() {
    this.models = await loadModels();
  }

  async updateRepository(
    operation,
    operationResult,
    ual,
    assertionId,
    hostname,
    operationStart,
    operationEnd,
    blockchain,
    errorMessage,
    errorType
  ) {
    const operationInfo =
      operation !== "get"
        ? operationResult?.operation
        : operationResult?.publicGet?.operation;
    await this.models[`script_${operation}`].create({
      operation_id: operationInfo?.operationId ?? "",
      status: operationInfo?.status ?? "FAILED",
      created_at: Date.now(),
      hostname,
      ual,
      assertion_id: assertionId,
      start_timestamp: operationStart,
      end_timestamp: operationEnd,
      blockchain,
      errorMessage: operationInfo?.errorMessage ?? errorMessage,
      errorType: operationInfo?.errorType ?? errorType,
    });
  }
}

module.exports = Repository;
