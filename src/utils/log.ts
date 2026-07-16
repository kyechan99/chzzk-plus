const isDev = true;

export const log = (msg: unknown) => {
  if (isDev) console.log(`[Cheese-Plus] : ${msg}`);
};

export const logError = (msg: unknown) => {
  if (isDev) console.error(`[Cheese-Plus] : ${msg}`);
};

export const logWarning = (msg: unknown) => {
  if (isDev) console.warn(`[Cheese-Plus] : ${msg}`);
};
