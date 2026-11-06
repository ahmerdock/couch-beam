export type TvRemoteErrorCode = "pairing" | "connection";

export class TvRemoteError extends Error {
  readonly code: TvRemoteErrorCode;

  constructor(code: TvRemoteErrorCode, message: string) {
    super(message);
    this.name = "TvRemoteError";
    this.code = code;
  }
}

export const isTvRemoteError = (
  error: unknown,
  code?: TvRemoteErrorCode,
): error is TvRemoteError =>
  error instanceof TvRemoteError && (code === undefined || error.code === code);
