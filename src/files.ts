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
import { UserFile } from "./user_file.js";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { LangflowUploadResponseUserFile } from "./types.js";
import { FormData } from "undici";

export class Files {
  client: LangflowClient;

  constructor(client: LangflowClient) {
    this.client = client;
  }

  async upload(path: string, options: { signal?: AbortSignal } = {}) {
    const fileBuffer = await readFile(path);
    const fileName = basename(path);
    const file = new File([fileBuffer], fileName);

    const formData = new FormData();
    formData.append("file", file, fileName);

    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = (await this.client.request({
      path: `/v2/files`,
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
      path: `/v2/files`,
      method: "GET",
      headers,
      signal,
    })) as LangflowUploadResponseUserFile[];
    return response.map((file) => new UserFile(file));
  }

  async download(fileId: string, options: { signal?: AbortSignal } = {}) {
    const headers = new Headers();
    headers.set("Accept", "application/octet-stream");
    const { signal } = options;
    const response = await this.client.request({
      path: `/v2/files/${fileId}`,
      method: "GET",
      headers,
      signal,
    });
    return response;
  }
}
