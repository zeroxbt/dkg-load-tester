require("dotenv").config();
const DkgClient = require("dkg.js");
const { readFileSync } = require("fs");
const loadModels = require("./repository-service.js");
const { setTimeout } = require("timers/promises");

const endpoints = JSON.parse(readFileSync("./endpoints.json"));

let models;

const CLIENT_ERROR_TYPE = "DKG_CLIENT_ERROR";

const client = new DkgClient({
  port: 8900,
  useSSL: true,
  loglevel: "trace",
});

const logDivider = () => {
  console.log(
    "-------------------------------------------------------------------------------------------------"
  );
};

const getRandomEndpoint = (operation, blockchain) => {
  const hostnameIndex = Math.floor(Math.random() * endpoints.length);
  const endpoint = endpoints[hostnameIndex];
  console.log(
    `Calling ${operation} on blockchain: ${blockchain}, endpoint: ${endpoint}`
  );
  return endpoint;
};

const updateRepository = (
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
) => {
  models[`script_${operation}`].create({
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
};

const publish = async (blockchain) => {
  logDivider();

  const content = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "John Doe",
    identifier: Math.floor(Math.random() * 1e10),
  };

  const hostname = getRandomEndpoint("publish", blockchain.name);
  let publishOptions = {
    visibility: "public",
    holdingTimeInYears: 1,
    tokenAmount: 10,
    blockchain,
    maxNumberOfRetries: 5,
    endpoint: hostname,
  };

  const start = Date.now();
  let errorMessage = null;
  let errorType = null;
  const publishResult = await client.asset
    .create(content, publishOptions)
    .catch((e) => {
      errorType = CLIENT_ERROR_TYPE;
      errorMessage = e.message;
      console.log(`Publishing error : ${errorMessage}`);
    });

  const end = Date.now();
  console.log(`Publish result : ${JSON.stringify(publishResult, null, 2)}`);

  updateRepository(
    "publish",
    publishResult,
    publishResult?.UAL,
    publishResult?.assertionId,
    hostname,
    start,
    end,
    blockchain.name,
    errorMessage,
    errorType
  );

  logDivider();

  return publishResult;
};

const get = async (ual, assertionId, blockchain) => {
  logDivider();

  const hostname = getRandomEndpoint("get", blockchain.name);
  let getOptions = {
    validate: true,
    blockchain,
    maxNumberOfRetries: 5,
    endpoint: hostname,
  };

  const start = Date.now();
  let errorMessage = null;
  let errorType = null;
  const getResult = await client.asset.get(ual, getOptions).catch((e) => {
    errorType = CLIENT_ERROR_TYPE;
    errorMessage = e.message;
    console.log(`Get error : ${errorMessage}`);
  });
  const end = Date.now();

  console.log(`Get result : ${JSON.stringify(getResult, null, 2)}`);

  updateRepository(
    "get",
    getResult,
    ual,
    assertionId,
    hostname,
    start,
    end,
    blockchain.name,
    errorMessage,
    errorType
  );

  logDivider();
};

(async () => {
  models = await loadModels();
  while (true) {
    const publishResult = await publish({
      name: "otp",
      publicKey: process.env.PUBLIC_KEY,
      privateKey: process.env.PRIVATE_KEY,
    });

    await setTimeout(5 * 1000);

    if (publishResult?.operation?.status === "COMPLETED") {
      await get(publishResult?.UAL, publishResult?.assertionId, {
        name: "otp",
        publicKey: process.env.PUBLIC_KEY,
        privateKey: process.env.PRIVATE_KEY,
      });
    }
    await setTimeout(5 * 1000);
  }
})();
