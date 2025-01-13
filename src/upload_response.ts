import { LangflowUploadResponse } from "./types.js";

export class UploadResponse {
  flowId: string;
  filePath: string;

  constructor(response: LangflowUploadResponse) {
    this.flowId = response.flowId;
    this.filePath = response.file_path;
  }
}
