self.onmessage = (e: MessageEvent) => {
  const { iterations } = e.data;

  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i);
  }

  self.postMessage({ result: sum });
};
