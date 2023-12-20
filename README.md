# INTRODUCTION

-This is an external adapter implementation to query the subscribercount from a youtube chanel, and return the value in a smartcontract.

# Recommended Prerequisites

- You have some programming experience (untyped languages is fine).

- Metamask account, with Sepholi Eth and Sepholi Link (get both from [Chainlink Faucets](faucets.chain.link))

- You have a running local Chainlink Node. You can follow along with [this live stream](https://youtu.be/4tIgRvc8WxQ) to do that. In this demo, I already have a Chainlink node up and running on my machine and so my External Adapter is able to interact with it.

# Repo Structure

There are three branches

- `1_start_here`: As the name suggests we start the demo here. Clone this repo on this branch and it sets you up with the `package.json` dependencies and the `tsconfig.json` basic setup. We will use typescript so you can follow the External Adapter's input and output data structures better. This branch also has a `ConsumerContract.sol` which is our calling contract. This contract calls an Operator/Oracle contract that is associated with the Chainlink Node. Scroll further in this README to see how the architecture works.

- `2_ea_server` This branch has the code for the External Adapter Express JS server that we code in the live demo. The project is in TypeScript, but is simple enough that JS developers will be able to follow along.

- `3_advanced_ea_server` This has a JavaScript only implementation of a more advanced External Adapter Express JS server that uses [this template](https://github.com/thodges-gh/CL-EA-NodeJS-Template) which includes much more sophisticated error handling, logging, retry logic, input and output data validation etc.


# Getting Started

Clone this repo with `git clone https://github.com/janiapro/SubsExtAd` and make sure you're in the `1_start_here` branch. Then run `yarn install` to install the dependencies.

# External Adapter Data Structures

## Request Data

Requests to External Adapters conform to the following structure ([docs](https://docs.chain.link/docs/developers/#requesting-data)). Not all fields are required though.

You can check that your external adapter is responsive by sending it a manual `curl` request that simulates what it would receive from a Chainlink Node.
```
{
  data: { chid: '', key: '' },
  id: '0x93fd920063d2462d8dce013a7fc75656',
  meta: {
    oracleRequest: {
     // .... some data ....
    }
  }
}

```

## Response Data

Our external adapter returns data in the following structure ([docs](https://docs.chain.link/docs/developers/#returning-data)). Not all fields are required though.

```
returned response:   {
  jobRunId: '0x93fd920063d2462d8dce013a7fc75656',
  statusCode: 200,
  data: {
    result: statistics: [subscriberCount]
  }
}
```

# Architecture Diagram

![alt Architecture Drawing Showing The Interaction within the System](./architecture.png "Architecture Diagram")
