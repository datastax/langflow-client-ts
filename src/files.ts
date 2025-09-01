// Copyright DataStax, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { LangflowClient } from "./index.js";
import { UserFile, type LangflowUploadResponseUserFile } from "./user_file.js";
import { FormData, Headers } from "undici";

export class Files {
  client: LangflowClient;

  constructor(client: LangflowClient) {
    this.client = client;
  }

  async upload(file: File | Blob, options: { signal?: AbortSignal } = {}) {
    const formData = new FormData();
    formData.append("file", file);

    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = (await this.client.request({
      path: "/v2/files",
      method: "POST",
      body: formData,
      headers,
      signal: options.signal,
    })) as LangflowUploadResponseUserFile;
    return new UserFile(response);
  }

  async list(options: { signal?: AbortSignal } = {}) {
    const headers = new Headers();
    headers.set("Accept", "application/json");
    const { signal } = options;
    const response = (await this.client.request({
      path: "/v2/files",
      method: "GET",
      headers,
      signal,
    })) as LangflowUploadResponseUserFile[];
    return response.map((file) => new UserFile(file));
  }
}
