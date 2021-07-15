const benchmarkStartup = async () => {
  const runs = 20;
  const stats = Object.create(null);
  stats["worker.total"] = 0;
  for (let i = 0; i < runs; i++) {
    stats["worker.start"] = performance.now();
    const worker = new Worker(`./workers/worker.js?x=${Math.random()}`);
    await new Promise((resolve) => {
      worker.onmessage = resolve;
      worker.postMessage(1);
    });
    stats["worker.end"] = performance.now();
    stats["worker.total"] += stats["worker.end"] - stats["worker.start"];
    worker.terminate();
  }

  stats["moduleWorker.total"] = 0;
  for (let i = 0; i < runs; i++) {
    stats["moduleWorker.start"] = performance.now();
    const moduleWorker = new Worker(
      `./workers/moduleWorker.js?x=${Math.random()}`,
      {
        type: "module",
      }
    );
    await new Promise((resolve) => {
      moduleWorker.onmessage = resolve;
      moduleWorker.postMessage(1);
    });
    stats["moduleWorker.end"] = performance.now();
    stats["moduleWorker.total"] +=
      stats["moduleWorker.end"] - stats["moduleWorker.start"];
    moduleWorker.terminate();
  }

  stats["fakeWorker.total"] = 0;
  for (let i = 0; i < runs; i++) {
    stats["fakeWorker.start"] = performance.now();
    const { port } = await import(`./workers/fakeWorker.js?x=${Math.random()}`);
    await new Promise((resolve) => {
      port.onmessage = resolve;
      port.postMessage(1);
    });
    stats["fakeWorker.end"] = performance.now();
    stats["fakeWorker.total"] +=
      stats["fakeWorker.end"] - stats["fakeWorker.start"];
  }

  const prettyStats = {
    worker: `${stats["worker.total"]}ms`,
    moduleWorker: `${stats["moduleWorker.total"]}ms`,
    fakeWorker: `${stats["fakeWorker.total"]}ms`,
  };
  const $OutputStartup = document.getElementById("OutputStartup");
  $OutputStartup.textContent = JSON.stringify(prettyStats, null, 2);
};

const benchmarkThroughput = async () => {
  const runs = 6_000;
  const stats = Object.create(null);
  const worker = new Worker(`./workers/worker.js?x=${Math.random()}`);
  stats["worker.start"] = performance.now();
  for (let i = 0; i < runs; i++) {
    await new Promise((resolve) => {
      worker.onmessage = resolve;
      worker.postMessage(1);
    });
  }
  stats["worker.end"] = performance.now();
  worker.terminate();

  const moduleWorker = new Worker(
    `./workers/moduleWorker.js?x=${Math.random()}`,
    {
      type: "module",
    }
  );
  stats["moduleWorker.start"] = performance.now();
  for (let i = 0; i < runs; i++) {
    await new Promise((resolve) => {
      moduleWorker.onmessage = resolve;
      moduleWorker.postMessage(1);
    });
  }
  stats["moduleWorker.end"] = performance.now();
  moduleWorker.terminate();

  stats["fakeWorker.start"] = performance.now();
  const { port } = await import(`./workers/fakeWorker.js?x=${Math.random()}`);
  port.start();
  for (let i = 0; i < runs; i++) {
    await new Promise((resolve) => {
      port.onmessage = resolve;
      port.postMessage(1);
    });
  }
  stats["fakeWorker.end"] = performance.now();
  port.close();

  const prettyStats = {
    worker: `${runs} messages in ${
      stats["worker.end"] - stats["worker.start"]
    }ms`,
    moduleWorker: `${runs} messages in ${
      stats["moduleWorker.end"] - stats["moduleWorker.start"]
    }ms`,
    fakeWorker: `${runs} messages in ${
      stats["fakeWorker.end"] - stats["fakeWorker.start"]
    }ms`,
  };
  const $OutputThroughput = document.getElementById("OutputThroughput");
  $OutputThroughput.textContent = JSON.stringify(prettyStats, null, 2);
};

const $ButtonStartup = document.querySelector("#ButtonStartup");
$ButtonStartup.onclick = benchmarkStartup;

const $ButtonThroughput = document.querySelector("#ButtonThroughput");
$ButtonThroughput.onclick = benchmarkThroughput;
