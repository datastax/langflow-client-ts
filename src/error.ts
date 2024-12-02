export class LangflowError extends Error {
  constructor(message: string, response: Response) {
    super(message, { cause: response });
  }
}
