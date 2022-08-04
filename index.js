require("dotenv").config();
const { setTimeout } = require("timers/promises");
const DkgClient = require("dkg.js");
const { readFileSync } = require("fs");
const loadModels = require("./repository-service.js");

const endpoints = JSON.parse(readFileSync("./endpoints.json"));

let models;
const blockchains = ["polygon", "otp"];

const clients = endpoints.map(
  (endpoint) =>
    new DkgClient({
      endpoint,
      port: 8900,
      communicationType: "http",
      useSSL: true,
      loglevel: "trace",
      blockchain: "polygon",
      blockchainConfig: {
        polygon: {
          rpc: process.env.POLYGON_RPC,
          hubContract: "0xdaa16AC171CfE8Df6F79C06E7EEAb2249E2C9Ec8",
          wallet: process.env.PUBLIC_KEY,
          privateKey: process.env.PRIVATE_KEY,
        },
        otp: {
          rpc: process.env.OTP_RPC,
          hubContract: "0x6e002616ADf12D4Cc908976eB16a7646B6cD6596",
          wallet: process.env.PUBLIC_KEY,
          privateKey: process.env.PRIVATE_KEY,
        },
      },
    })
);

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
  blockchain
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
    wallet: process.env.PUBLIC_KEY,
    maxNumberOfRetries: 5,
  };

  const { client, hostname } = getRandomClient("publish", blockchain);
  const start = Date.now();
  const publishResult = await client.asset
    .create(content, publishOptions)
    .catch((e) => console.log(`Publishing error : ${e.message}`));
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
    blockchain
  );

  logDivider();

  return publishResult;
};

const get = async (ual, assertionId, blockchain) => {
  logDivider();

  let getOptions = {
    validate: true,
    outputFormat: "json-ld",
    commitOffset: 0,
    blockchain,
    maxNumberOfRetries: 5,
  };
  const { client, hostname } = getRandomClient("get", blockchain);

  const start = Date.now();
  const getResult = await client.asset
    .get(ual, getOptions)
    .catch((e) => console.log(`Get error : ${e.message}`));
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
    blockchain
  );

  logDivider();
};

(async () => {
  models = await loadModels();
  while (true) {
    const blockchain =
      blockchains[Math.floor(Math.random() * blockchains.length)];
    const publishResult = await publish(blockchain);

    if (publishResult?.operation?.status === "COMPLETED") {
      await get(publishResult?.UAL, publishResult?.assertionId, blockchain);
    }
  }
})();
