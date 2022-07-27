import "dotenv/config";
import { setTimeout } from "timers/promises";
import { DkgClient } from "dkg.js/index-new.js";
import { readFileSync } from "fs";

// const loadModels = require("./repository-service");
const endpoints = JSON.parse(readFileSync("./endpoints.json"));

let models;
const sleepSeconds = 60;

const clients = endpoints.map(
  (endpoint) =>
    new DkgClient({
      endpoint,
      port: 8900,
      communicationType: "http",
      useSSL: true,
      loglevel: "trace",
      blockchain: "ethereum",
      blockchainConfig: {
        ethereum: {
          rpc: "http://localhost:7545",
          hubContract: "0xdaa16AC171CfE8Df6F79C06E7EEAb2249E2C9Ec8",
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

const getRandomClient = (operation) => {
  const clientIndex = Math.floor(Math.random() * clients.length);
  const hostname = endpoints[clientIndex];
  console.log(`Calling ${operation} from endpoint : ${hostname}`);
  return { hostname, client: clients[clientIndex] };
};

const updateRepository = (
  operation,
  operationResult,
  ual,
  assertionId,
  hostname,
  operationStart,
  operationEnd
) => {
  models[`script_${operation}`].create({
    handler_id: operationResult?.operation_id ?? "",
    status: operationResult?.status ?? "FAILED",
    created_at: Date.now(),
    hostname,
    ual,
    assertion_id: assertionId,
    start_timestamp: operationStart,
    end_timestamp: operationEnd,
  });
};

const publish = async () => {
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
    blockchain: "ethereum",
    wallet: process.env.PUBLIC_KEY,
    maxNumberOfRetries: 5,
  };

  const { client, hostname } = getRandomClient("publish");
  const start = Date.now();
  const publishResult = await client.asset
    .create(content, publishOptions)
    .catch((e) => console.log(`Publishing error : ${e.message}`));
  const end = Date.now();
  console.log(`Publish result : ${JSON.stringify(publishResult, null, 2)}`);

  /* updateRepository(
    "publish",
    publishResult,
    publishResult.UAL,
    publishResult.assertionId,
    hostname,
    start,
    end
  ); */

  logDivider();

  return publishResult;
};

const get = async (ual, assertionId) => {
  logDivider();

  let getOptions = {
    validate: true,
    outputFormat: "json-ld",
    commitOffset: 0,
    blockchain: "ethereum",
    maxNumberOfRetries: 5,
  };
  const { client, hostname } = getRandomClient("resolve");

  const start = Date.now();
  const resolveResult = await client.asset
    .get(ual, getOptions)
    .catch((e) => console.log(`Resolving error : ${e.message}`));
  const end = Date.now();

  console.log(`Resolve result : ${JSON.stringify(resolveResult, null, 2)}`);

  /* updateRepository(
    "resolve",
    publishResult,
    ual,
    assertionId,
    hostname,
    start,
    end
  ); */

  logDivider();
};

(async () => {
  // models = await loadModels();
  while (true) {
    const publishResult = await publish();

    if (publishResult && publishResult.status === "COMPLETED") {
      await get(publishResult.UAL, publishResult.assertionId);
    }

    await setTimeout(1000 * sleepSeconds);
  }
})();
