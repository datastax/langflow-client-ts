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
