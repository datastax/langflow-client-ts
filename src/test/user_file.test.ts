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

import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { UserFile } from "../user_file.js";

const userFileData = {
  id: "b8fdff49-024e-48e2-acdd-7cd1e4d32d46",
  name: "bodi",
  path: "579f0128-52e1-4cf7-b5d4-5091d2697f1e/b8fdff49-024e-48e2-acdd-7cd1e4d32d46.jpg",
  size: 29601,
  provider: undefined,
  created_at: "2025-06-11T07:34:43.603Z",
  updated_at: "2025-06-11T07:34:43.603Z",
  user_id: "user_id1234",
};

describe("UserFile", () => {
  const userFile = new UserFile(userFileData);

  it("converts created_at string to date", () => {
    assert.ok(userFile.created_at instanceof Date);
  });

  it("converts updated_at string to date", () => {
    assert.ok(userFile.updated_at instanceof Date);
  });
});
