import { type Response } from "undici";

export class LangflowError extends Error {
  cause: Response;

  constructor(message: string, response: Response) {
    super(message, { cause: response });
    this.cause = response;
  }

  response(): Response {
    return this.cause;
  }
}

export class LangflowRequestError extends Error {
  cause: Error;

  constructor(message: string, error: Error) {
    super(message, { cause: error });
    this.cause = error;
  }

  error(): Error {
    return this.cause;
  }
}
