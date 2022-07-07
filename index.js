require("dotenv").config();
const { setTimeout } = require("timers/promises");
const randomWords = require("random-words");
const DkgClient = require("dkg.js");
const loadModels = require("./repository-service");
const endpoints = require("./endpoints.json");

let models;
const sleepSeconds = 60;

const clients = endpoints.map(
  (endpoint) =>
    new DkgClient({
      endpoint,
      useSSL: true,
      port: 8900,
      loglevel: "info",
    })
);

const publish = async () => {
  const content = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "John Doe",
  };

  const publishOptions = {
    visibility: "public",
  };

  const clientIndex = Math.floor(Math.random() * clients.length);
  const randomClient = clients[clientIndex];
  publishOptions.keywords = randomWords(5);

  console.log(
    "-------------------------------------------------------------------------------------------------"
  );
  console.log(`Publishing from endpoint : ${endpoints[clientIndex]}`);
  const publishStart = Date.now();
  const publishResult = await randomClient.assets
    .create(content, publishOptions, {
      publicKey: process.env.PUBLIC_KEY,
      privateKey: process.env.PRIVATE_KEY,
    })
    .catch((e) => console.log(`Publishing error : ${e.message}`));
  const publishEnd = Date.now();
  console.log(`Publish result : ${JSON.stringify(publishResult, null, 2)}`);
  console.log(
    "-------------------------------------------------------------------------------------------------"
  );

  models.script_publish.create({
    handler_id: publishResult?.handler_id ?? "",
    status: publishResult?.status ?? "FAILED",
    created_at: Date.now(),
    hostname: endpoints[clientIndex],
    ual: publishResult?.data?.ual,
    assertion_id: publishResult?.data?.assertionId,
    start_timestamp: publishStart,
    end_timestamp: publishEnd,
  });

  return publishResult;
};

const resolve = async (ual, assertionId) => {
  const resolveOptions = {
    outputFormat: "json-ld",
    validateOutput: true,
  };
  const clientIndex = Math.floor(Math.random() * clients.length);
  const randomClient = clients[clientIndex];

  console.log(
    "-------------------------------------------------------------------------------------------------"
  );
  console.log(`Resolving from endpoint : ${endpoints[clientIndex]}`);
  const resolveStart = Date.now();
  const resolveResult = await randomClient
    .resolve(`${ual}/${assertionId}`, resolveOptions)
    .catch((e) => console.log(`Resolving error : ${e.message}`));
  const resolveEnd = Date.now();
  console.log(`Resolve result : ${JSON.stringify(resolveResult, null, 2)}`);
  console.log(
    "-------------------------------------------------------------------------------------------------"
  );

  models.script_resolve.create({
    handler_id: resolveResult?.handler_id ?? "",
    status: resolveResult?.status ?? "FAILED",
    created_at: Date.now(),
    hostname: endpoints[clientIndex],
    ual: ual,
    assertion_id: assertionId,
    start_timestamp: resolveStart,
    end_timestamp: resolveEnd,
  });
};

(async () => {
  models = await loadModels();
  while (true) {
    const publishResult = await publish();
    if (
      publishResult &&
      publishResult.data &&
      publishResult.data.ual &&
      publishResult.data.assertionId
    ) {
      await resolve(publishResult.data.ual, publishResult.data.assertionId);
    }
    await setTimeout(1000 * sleepSeconds);
  }
})();
