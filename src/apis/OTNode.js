const DKGClient = require("dkg.js");
const Repository = require("./Repository.js");

const CLIENT_ERROR_TYPE = "DKG_CLIENT_ERROR";

class OTNode {
  constructor() {
    this.dkg = new DKGClient({
      port: 8900,
      useSSL: true,
    });

    this.blockchain = {
      name: "otp",
      rpc: "wss://lofar.origin-trail.network",
    };

    this.repository = new Repository();
  }

  async initialize() {
    await this.repository.initialize();
  }

  async publish(content, endpoint, wallet) {
    let options = {
      visibility: "public",
      holdingTimeInYears: 1,
      tokenAmount: 10,
      maxNumberOfRetries: 30,
      frequency: 2,
      endpoint,
      blockchain: { ...blockchain, ...wallet },
    };

    return this.operation("publish", "create", [content, options]);
  }

  async get(ual, endpoint, wallet) {
    let options = {
      validate: true,
      maxNumberOfRetries: 30,
      frequency: 2,
      endpoint,
      blockchain: { ...blockchain, ...wallet },
    };

    return this.operation("get", "get", [ual, options]);
  }

  async operation(type, operation, args) {
    logDivider();

    console.log(
      `Calling ${type} on blockchain: ${this.blockchain.name}, endpoint: ${args[1].endpoint}`
    );

    const start = Date.now();
    let errorType = null;
    let errorMessage = null;
    const result = await dkg.asset[operation](...args).catch((e) => {
      errorType = CLIENT_ERROR_TYPE;
      errorMessage = e.message;
      console.log(`${type} error : ${errorMessage}`);
    });

    const end = Date.now();
    console.log(`${type} result : ${JSON.stringify(result, null, 2)}`);

    this.repository.updateRepository(
      type,
      result,
      result?.UAL,
      result?.assertionId,
      hostname,
      start,
      end,
      blockchain.name,
      errorMessage,
      errorType
    );

    logDivider();

    return result;
  }
}

module.exports = OTNode;