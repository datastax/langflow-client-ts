# Changelog for `@datastax/langflow-client`

## Ongoing [☰](https://github.com/datastax/langflow-client-ts/compare/v0.3.1...main)

...

## 0.3.1 (June 2, 2025) [☰](https://github.com/datastax/langflow-client-ts/compare/v0.3.0...0.3.1)

### Changed

- When you explicitly try to set the `baseUrl` for a client, but it is undefined, null or empty, it now throws an error with a better explanation.

## 0.3.0 (May 30, 2025) [☰](https://github.com/datastax/langflow-client-ts/compare/v0.2.1...v0.3.0)

### Added

- Fetching and streaming of logs

### Changed

- Base URL no longer includes the API version to allow for using v2 APIs

## 0.2.1 (March 1, 2025) [☰](https://github.com/datastax/langflow-client-ts/compare/v0.2.0...v0.2.1)

### Fixed

- Responses from agent components have a different structure to model components. Now we handle both in `flowResponse.chatOutputText()`

## 0.2.0 (February 13, 2025) [☰](https://github.com/datastax/langflow-client-ts/compare/v0.1.1...v0.2.0)

### Added

- Support for streaming responses with `flow.stream()`
- Support for AbortController and request timeouts
- Repository, homepage, and bugs links to package.json

### Changed

- Simplified error classes
- Updated documentation with streaming and request aborting sections

## 0.1.1 (January 17, 2025) [☰](https://github.com/datastax/langflow-client-ts/compare/v0.1.0...v0.1.1)

### Updated

- Allows flow run options to be optional

## 0.1.0 (January 17, 2025) [☰](https://github.com/datastax/langflow-client-ts/commits/v.0.1.0)

Initial release.

- Support for running a flow with either open source Langflow or DataStax hosted Langflow
- Support for uploading a file to be used when running a flow
