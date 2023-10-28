export const sleep = (seconds: number): Promise<void> => {
  let sleepResolve: (value: void | PromiseLike<void>) => void;
  const promise = new Promise<void>((resolve, reject) => {
    sleepResolve = resolve;
  });
  setTimeout(() => {
    sleepResolve();
  }, seconds * 1000);
  return promise;
};
