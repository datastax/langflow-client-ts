# JavaScript client for the Langflow API

This package provides an easy way to use the [Langflow API](https://docs.datastax.com/en/langflow/api.html) from within server-side JavaScript applications.

- [Installation](#installation)
  - [With npm](#with-npm)
  - [With yarn](#with-yarn)
  - [With pnpm](#with-pnpm)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Calling a flow](#calling-a-flow)
    - [Flow reponses](#flow-reponses)
  - [\[TODO\] Streaming](#todo-streaming)
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

## Configuration

You will need a [Langflow API key](https://docs.datastax.com/en/langflow/concepts/settings.html#langflow-api). You provide the API key when you create a new client.

## Usage

You can import the client like so:

```js
import { LangflowClient } from "@datastax/langflow-client";
```

### Initialization

You can then create a new client object with the following options:

- `langflowId`: The ID of your organisation, which can be found in the URL while you are logged into DataStax Langflow
- `apiKey`: A Langflow API key that can be generated within your DataStax account
- `baseURL`: This is `https://api.langflow.astra.datastax.com` and it is set by default, so it is optional

```js
const client = new LangflowClient({ baseUrl, langflowId, apiKey });
```

### Calling a flow

Once you have a client, you can create a reference to a flow using the `flowID`. This can be found in the API modal in DataStax Langflow.

```js
const flow = client.flow(flowId);
```

You can run a flow by calling `run` with the input to the flow:

```js
const response = await client.flow(flowId).run(input);
```

You can add tweaks to a flow like so:

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

You can also pass input and output options, as well as a session ID:

```js
const response = await client
  .flow(flowId)
  .run(input, { tweaks, input_type, output_type, session_id });
```

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

### [TODO] Streaming

If your components support it, you can stream the results of a flow like so:

```js
const stream = client.flow(flowId).stream(input);
```

The `stream` will be a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

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
