require("dotenv").config();
const DkgClient = require("dkg.js");
const { readFileSync } = require("fs");
const loadModels = require("./repository-service.js");

const endpoints = JSON.parse(readFileSync("./endpoints.json"));

let models;

const CLIENT_ERROR_TYPE = "DKG_CLIENT_ERROR";

const clients = endpoints.map(
    (endpoint) =>
      new DkgClient({
        endpoint,
        port: 8900,
        useSSL: true,
        loglevel: "trace",
      })
  )

const logDivider = () => {
  console.log(
    "-------------------------------------------------------------------------------------------------"
  );
};

const getRandomClient = (operation, blockchain) => {
  const clientIndex = Math.floor(Math.random() * clients.length);
  const hostname = endpoints[clientIndex];
  console.log(
    `Calling ${operation} on blockchain: ${blockchain}, endpoint: ${hostname}`
  );
  return { hostname, client: clients[clientIndex] };
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
    errorMessage:
      operationResult?.operation?.status === "FAILED"
        ? operationResult?.operation?.errorMessage
        : errorMessage,
    errorType:
      operationResult?.operation?.status === "FAILED"
        ? operationResult?.operation?.errorType
        : errorType,
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

  let publishOptions = {
    visibility: "public",
    holdingTimeInYears: 1,
    tokenAmount: 10,
    blockchain,
    maxNumberOfRetries: 5,
  };

  const { client, hostname } = getRandomClient("publish", blockchain);
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

  let getOptions = {
    validate: true,
    blockchain,
    maxNumberOfRetries: 5,
  };
  const { client, hostname } = getRandomClient("get", blockchain);

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

      if (publishResult?.operation?.status === "COMPLETED") {
        await get(publishResult?.UAL, publishResult?.assertionId, {
          name: "otp",
          publicKey: process.env.PUBLIC_KEY,
          privateKey: process.env.PRIVATE_KEY,
        });
      }
  }
})();
