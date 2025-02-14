export class Log {
  timestamp: Date;
  message: string;

  constructor(timestamp: string, message: string) {
    this.timestamp = new Date(parseInt(timestamp, 10));
    this.message = message;
  }
}
