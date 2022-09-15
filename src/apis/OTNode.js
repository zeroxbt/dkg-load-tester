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
      blockchain: { ...this.blockchain, ...wallet },
    };

    return this.operation("publish", "create", [content], options);
  }

  async get(ual, endpoint, wallet) {
    let options = {
      validate: true,
      maxNumberOfRetries: 30,
      frequency: 2,
      endpoint,
      blockchain: { ...this.blockchain, ...wallet },
    };

    return this.operation("get", "get", [ual], options);
  }

  async operation(type, operation, args, options) {
    this.logDivider();

    console.log(
      `Calling ${type} on blockchain: ${this.blockchain.name}, endpoint: ${options.endpoint}`
    );

    const start = Date.now();
    let errorType = null;
    let errorMessage = null;
    const result = await this.dkg.asset[operation](...args, options).catch((e) => {
      errorType = CLIENT_ERROR_TYPE;
      errorMessage = e.message;
      console.log(`${type} error : ${errorMessage}`);
    });
    const end = Date.now();

    console.log(`${type} result : ${JSON.stringify(type === "get" ? {...result, assertion: undefined} : result, null, 2)}`);

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
    console.log("---------------------------------------------------------------------")
  }
}

module.exports = OTNode;
