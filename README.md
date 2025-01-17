# JavaScript client for the Langflow API

This package provides an easy way to use the [Langflow API](https://docs.datastax.com/en/langflow/api.html) to run flows from within server-side JavaScript applications.

- [Installation](#installation)
  - [With npm](#with-npm)
  - [With yarn](#with-yarn)
  - [With pnpm](#with-pnpm)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
  - [DataStax Langflow](#datastax-langflow)
  - [Open-source Langflow](#open-source-langflow)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Calling a flow](#calling-a-flow)
    - [Flow reponses](#flow-reponses)
  - [File upload](#file-upload)
- [Contributing](#contributing)

## Installation

### With npm

```sh
npm install @datastax/langflow-client
```

### With yarn

```sh
yarn add @datastax/langflow-client
```

### With pnpm

```sh
pnpm add @datastax/langflow-client
```

## Prerequisites

To use this Langflow client you will need a DataStax account with which you can use [DataStax Langflow](https://docs.datastax.com/en/langflow/index.html). You will need a flow before you can call its API. If you don't already have one, you can get started with the [Basic Prompting Flow](https://docs.datastax.com/en/langflow/quickstart.html).

You can also use this with an installation of [open-source Langflow](https://www.langflow.org/).

## Configuration

### DataStax Langflow

You will need a [Langflow API key](https://docs.datastax.com/en/langflow/concepts/settings.html#langflow-api). You provide the API key when you create a new client. You will also need your Langflow ID.

You can generate API keys and find your Langflow ID on the API modal in the Langflow flow editor.

### Open-source Langflow

You will need an installation of Langflow. You may also require an [API key](https://docs.langflow.org/configuration-api-keys) if you have set up [authentication on Langflow](https://docs.langflow.org/configuration-authentication).

## Usage

You can import the client like so:

```js
import { LangflowClient } from "@datastax/langflow-client";
```

### Initialization

You can then create a new client object with the following options:

- `baseURL`: This is set to `https://api.langflow.astra.datastax.com` by default, if you are running your own instance of Langflow you will need to provide the URL
- `langflowId`: The ID of your organisation, which can be found in the API modal of the flow editor. This is not required for your own instance of Langflow
- `apiKey`: A Langflow API key that can be generated within your DataStax account or in the settings of open-source Langflow

```js
// using DataStax Langflow, you do not need to provide the baseUrl
const dsLangflowClient = new LangflowClient({ langflowId, apiKey });

// for open-source langflow, you will need to provide a baseUrl and optionally an apiKey
const baseUrl = "http://localhost:7860";
const apiKey = "sk-...";
const osLangflowClient = new LangflowClient({ baseUrl, apiKey });
```

### Calling a flow

Once you have a client, you can create a reference to a flow using the `flowID`. This can be found in the API modal in Langflow.

```js
const flow = client.flow(flowId);
```

You can run a flow by calling `run` with the text input to the flow:

```js
const response = await client.flow(flowId).run(input);
```

You can add [tweaks](https://docs.langflow.org/concepts-api#tweaks) to a flow like so:

```js
const response = await client
  .flow(flowId)
  .tweak(tweakName, tweakOptions)
  .run(input);
```

Or you can pass all tweaks as an object:

```js
const response = await client.flow(flowId).run(input, { tweaks });
```

You can also pass input and output options, as well as a session ID.

```js
import { InputTypes, OutputTypes } from "@datastax/langflow-client/consts";

const response = await client.flow(flowId).run(input, {
  input_type: InputTypes.CHAT,
  output_type: OutputTypes.CHAT,
  session_id,
  tweaks,
});
```

The available input types are "chat", "text" and "any". The available output types are "chat", "text", "any" and "debug". The default for both is "chat".

#### Flow reponses

Langflow is very flexible in its output. So the `FlowResponse` object gives you raw access to the `sessionId` and the `outputs`.

```js
const response = await client.flow(flowId).run(input);
console.log(response.outputs);
```

There is one convenience function that will return you the first chat output message text. If you only have one chat output component in your flow, this is a useful shortcut to get to that response.

```js
const response = client.flow(flowId).run(input);
console.log(response.chatOutputText());
```

### File upload

Chat input components support files as input as well as text. You need to upload your file first, using the file upload function, then provide the file path to the flow as a tweak.

```js
const flow = client.flow(flowId)

const file = await flow.uploadFile(pathToFile);
console.log(file);
// => { flowId: "XXX", filePath: "YYY" }

const response = await flow.tweak("ChatInput-abcd": { files: file.filePath }).run("What can you see in this image?");
```

> [!WARNING]  
> DataStax Langflow doesn't make file upload available, you will receive a 501 Not Implemented error.

## Contributing

To run and contribute to this library you can clone the repository:

```sh
git clone git@github.com:datastax/langflow-client-ts.git
cd langflow-client-ts
```

Install the dependencies:

```sh
npm install
```

Run the tests:

```sh
npm test
```

Transpile the TypeScript to JavaScript:

```sh
npm run build
```

Transpile the TypeScript to JavaScript in watch mode:

```sh
npm run build:watch
```

Lint the code:

```sh
npm run lint
```

Format the code:

```sh
npm run format
```

Check the formatting of the code:

```sh
npm run format:check
```
