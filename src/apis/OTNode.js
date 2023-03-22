const DKGClient = require("dkg.js");
const Repository = require("./Repository.js");

const CLIENT_ERROR_TYPE = "DKG_CLIENT_ERROR";

class OTNode {
  constructor(logger) {
    this.logger = logger;
    this.dkg = new DKGClient({
      port: 8900,
      useSSL: true,
    });

    this.blockchain = {
      name: "otp::devnet",
      rpc: "wss://lofar.origin-trail.network",
      hubContract: "0x833048F6e6BEa78E0AAdedeCd2Dc2231dda443FB",
    };

    this.repository = new Repository();
  }

  async initialize() {
    await this.repository.initialize();
  }

  async publish(content, endpoint, wallet, loadTestId) {
    let options = {
      epochsNum: 5,
      maxNumberOfRetries: 30,
      frequency: 2,
      endpoint,
      blockchain: { ...this.blockchain, ...wallet },
    };

    return this.operation("publish", "create", [content], options, loadTestId);
  }

  async get(ual, endpoint, wallet, loadTestId) {
    let options = {
      validate: true,
      maxNumberOfRetries: 30,
      frequency: 2,
      endpoint,
      blockchain: { ...this.blockchain, ...wallet },
    };

    return this.operation("get", "get", [ual], options, loadTestId);
  }

  async update(ual, content, endpoint, wallet, loadTestId) {
    let options = {
      validate: true,
      maxNumberOfRetries: 30,
      frequency: 2,
      endpoint,
      blockchain: { ...this.blockchain, ...wallet },
    };

    return this.operation(
      loadTestId,
      "update",
      "update",
      [ual, content],
      options,
      loadTestId
    );
  }

  async operation(type, operation, args, options, loadTestId) {
    this.logDivider();

    this.logger.debug(
      `Calling ${type} on blockchain: ${this.blockchain.name}, endpoint: ${options.endpoint}, load test id: ${loadTestId}`
    );

    const start = Date.now();
    let errorType = null;
    let errorMessage = null;
    const result = await this.dkg.asset[operation](...args, options).catch(
      (e) => {
        errorType = CLIENT_ERROR_TYPE;
        errorMessage = e.message;
        this.logger.error(
          `Error for operation: ${type}, load test id: ${loadTestId} : ${errorMessage}`
        );
      }
    );
    const end = Date.now();

    this.logger.debug(
      `${type} result for load test id: ${loadTestId} : ${JSON.stringify(
        type === "get" ? { ...result, assertion: undefined } : { ...result },
        null,
        2
      )}`
    );

    this.repository.updateRepository(
      type,
      result,
      result?.UAL,
      result?.assertionId,
      options.endpoint,
      start,
      end,
      this.blockchain.name,
      errorMessage,
      errorType
    );

    this.logDivider();

    return result;
  }

  logDivider() {
    this.logger.trace(
      "---------------------------------------------------------------------"
    );
  }
}

module.exports = OTNode;
