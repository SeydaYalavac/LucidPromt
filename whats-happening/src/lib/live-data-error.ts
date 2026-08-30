export class LiveDataConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveDataConfigurationError";
  }
}

export function isLiveDataConfigurationError(
  error: unknown,
): error is LiveDataConfigurationError {
  return error instanceof LiveDataConfigurationError;
}
