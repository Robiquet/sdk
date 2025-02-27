# Galactic SDK

[![npm version](https://img.shields.io/npm/v/@galacticcouncil/sdk.svg)](https://www.npmjs.com/package/@galacticcouncil/sdk)

</p>
Galactic SDK is collection of components crafted to ease Basilisk & HydraDX chains integration.
<br />
<br />
Table of content:

- [Installation](#installation)
- [Components](#components)
  - [Router](#router)
  - [TradeRouter](#traderouter)
- [Examples](#examples)
- [Roadmap](#roadmap)
- [Issue reporting](#issue-reporting)

## Installation

Install with [npm](https://www.npmjs.com/):

`npm install @galacticcouncil/sdk`

## Components

### Router

Off-chain routing, build to find the most suitable routes across the pools. Building block for TradeRouter.

#### API

```typescript
getPools(): PoolBase[]
getAllAssets(): Asset[]
getAssetPairs(token: string): Asset[]
getAllPaths(tokenIn: string, tokenOut: string): Hop[][]
```

### TradeRouter

Off-chain optimization of orders across pools for best price execution. TradeRouter does not perform any on-chain transations.

#### API

```typescript
getBestSpotPrice(tokenIn: string, tokenOut: string): Amount
getBestSell(tokenIn: string, tokenOut: string, amountIn: BigNumber | number | string): Trade
getBestBuy(tokenIn: string, tokenOut: string, amountOut: BigNumber | number | string): Trade
```

For type signature visit [types.ts](src/types.ts)<br />

#### Usage

```typescript
// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
import { TradeRouter, PoolService, PoolType } from '@galacticcouncil/sdk';

// Initialize Polkadot API
const wsProvider = new WsProvider('wss://rpc.hydradx.cloud');
const api = await ApiPromise.create({ provider: wsProvider });

// Initialize Trade Router
const poolService = new PoolService(api);
const tradeRouter = new TradeRouter(poolService, {
  includeOnly: [PoolType.XYK],
});

// Do something
const result = await tradeRouter.getAllAssets();
console.log(result);
```

## Examples

SDK Examples and testing helpers.

### Run

Run: `$ npx tsx ./test/script/examples/<examplePackage>/<exampleName>.ts` with valid example package & name.

To demonstrate full working examples on real chain see [script](test/script/examples) section.

## Roadmap

Component list and current status ⬇️

- 🧪 Done
- 🛠 Work in progress
- ⏳ Planning to build

| Name        | Type |     |
| ----------- | :--: | --: |
| Router      | API  |  🧪 |
| TradeRouter | API  |  🧪 |
| XYK         | Math |  🧪 |
| XYK         | Pool |  🧪 |
| Omni        | Math |  🧪 |
| Omni        | Pool |  🧪 |
| LBP         | Math |  🧪 |
| LBP         | Pool |  🧪 |
| Stable      | Math |  🧪 |
| Stable      | Pool |  🧪 |

## Development and Build

### Requirements

- [Node.js](https://nodejs.org/) (**version 18 or higher**)

## Issue reporting

In case of unexpected sdk behaviour, please create well-written issue [here](https://https://github.com/galacticcouncil/sdk/issues/new). It makes it easier to find & fix the problem accordingly.
