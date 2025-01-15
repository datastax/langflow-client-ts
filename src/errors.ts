import { type Response } from "undici";

import { FlowResponse } from "./flow_response.js";

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

export class LangflowStreamError extends Error {
  cause: FlowResponse;

  constructor(message: string, response: FlowResponse) {
    super(message, { cause: response });
    this.cause = response;
  }

  response(): FlowResponse {
    return this.cause;
  }
}
