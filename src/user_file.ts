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

import { LangflowUploadResponseUserFile } from "./types.js";

export class UserFile {
  id: string;
  name: string;
  path: string;
  size: number;
  provider?: string;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;

  constructor({
    id,
    name,
    path,
    size,
    provider,
    user_id,
    created_at,
    updated_at,
  }: LangflowUploadResponseUserFile) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.size = size;
    this.provider = provider;
    this.user_id = user_id;
    this.created_at = created_at ? new Date(created_at) : undefined;
    this.updated_at = updated_at ? new Date(updated_at) : undefined;
  }
}
