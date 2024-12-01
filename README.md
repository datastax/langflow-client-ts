# JavaScript client for the Langflow API

This package provides an easy way to use the [Langflow API](https://docs.datastax.com/en/langflow/api.html) from within server-side JavaScript applications.

* [Installation](#installation)
  * [With npm](#with-npm)
  * [With yarn](#with-yarn)
  * [With pnpm](#with-pnpm)
* [Prerequisites](#prerequisites)
* [Configuration](#configuration)
* [Usage](#usage)
  * [Initialization](#initialization)
  * [Calling a flow](#calling-a-flow)
  * [Streaming](#streaming)

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

To use this Langflow client you will either need to have installed the open-source [Langflow](https://www.langflow.org/), or have a DataStax account with which you can use [DataStax Langflow](https://docs.datastax.com/en/langflow/index.html). You will need a flow before you can call its API. If you don't already have one, you can get started with the [Basic Prompting Flow](https://docs.datastax.com/en/langflow/quickstart.html).

## Configuration

If you are using this with DataStax Langflow, you will need a [Langflow API key](https://docs.datastax.com/en/langflow/concepts/settings.html#langflow-api). You can either provide the API key when you create a new client, or store it as `LANGFLOW_API_KEY` in the environment and the library will pick it up automatically.

## Usage

You can import the client like so:

```js
import { LangflowClient } from "@datastax/langflow-client";
```

### Initialization

You can then create a new client object using the base URL of your flow.

If you are using DataStax Langflow the base URL is `https://api.langflow.astra.datastax.com`, and you will need to also provide your Langflow ID, which can be found in the URL while you are logged into DataStax Langflow.

```js
const client = new LangflowClient({ baseUrl, langflowId });
```

If you are using open-source Langflow the base URL is wherever you are hosting your Langflow instance.

```js
const client = new LangflowClient({ baseUrl });
```

If you want to provide your API key, you can do it here too.

```js
const client = new LangflowClient({ baseUrl, apiKey });
```

### Calling a flow

Once you have a client, you can run a flow like so:

```js
client.flow(flowId).run(input);
```

You can add tweaks to a flow like so:

```js
client.flow(flowId).tweak(tweakName, tweakOptions).run(input);
```

Or you can pass all tweaks as an object:

```js
client.flow(flowId).run(input, { tweaks });
```

### Streaming

If your components support it, you can stream the results of a flow like so:

```js
const stream = client.flow(flowId).stream(input);
```

The `stream` will be a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).
