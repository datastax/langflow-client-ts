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

import { QueuingStrategy } from "node:stream/web";

export function NDJSONStream<T>(
  writableStrategy?: QueuingStrategy<string>,
  readableStrategy?: QueuingStrategy<T>
) {
  let buffer = "";
  return new TransformStream<string, T>(
    {
      transform(chunk, controller) {
        const text = chunk.toString();
        const lines = text.split("\n");
        for (const line of lines) {
          if (buffer.length === 0) {
            // Ignore lines until we find the start of a JSON object
            if (line.trimStart().startsWith("{")) {
              buffer += line;
            }
          } else {
            buffer += line;
          }
          try {
            const result = JSON.parse(buffer);
            controller.enqueue(result);
            buffer = "";
          } catch {
            // Not a valid JSON object
          }
        }
      },
    },
    writableStrategy,
    readableStrategy
  );
}
