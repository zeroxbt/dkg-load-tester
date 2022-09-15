const loadModels = require("../util/repository-service.js");

class Repository {
  async initialize() {
    this.models = await loadModels();
  }

  updateRepository(
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
    this.models[`script_${operation}`].create({
      operation_id: operationResult?.operation?.operationId ?? "",
      status: operationResult?.operation?.status ?? "FAILED",
      created_at: Date.now(),
      hostname,
      ual,
      assertion_id: assertionId,
      start_timestamp: operationStart,
      end_timestamp: operationEnd,
      blockchain,
      errorMessage: operationResult?.operation?.errorMessage ?? errorMessage,
      errorType: operationResult?.operation?.errorType ?? errorType,
    });
  }
}

module.exports = Repository;
