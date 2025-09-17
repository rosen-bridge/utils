export const sleep = (seconds: number): Promise<void> => {
  // eslint-disable-next-line no-unused-vars
  let sleepResolve: (value: void | PromiseLike<void>) => void;
  const promise = new Promise<void>((resolve) => {
    sleepResolve = resolve;
  });
  setTimeout(() => {
    sleepResolve();
  }, seconds * 1000);
  return promise;
};
