export type LogMeta = Record<string, unknown>;

export const logger = {
  info: (message: string, meta?: LogMeta) => {
    console.log(JSON.stringify({ level: "info", timestamp: new Date().toISOString(), message, ...meta }));
  },
  warn: (message: string, meta?: LogMeta) => {
    console.warn(JSON.stringify({ level: "warn", timestamp: new Date().toISOString(), message, ...meta }));
  },
  error: (message: string, error?: unknown, meta?: LogMeta) => {
    const errorDetails =
      error instanceof Error
        ? { errorMessage: error.message, stack: error.stack }
        : error !== undefined
          ? { errorMessage: String(error) }
          : {};

    console.error(
      JSON.stringify({
        level: "error",
        timestamp: new Date().toISOString(),
        message,
        ...errorDetails,
        ...meta,
      })
    );
  },
};
