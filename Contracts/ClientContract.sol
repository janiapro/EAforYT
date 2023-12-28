// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract ConsumerContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = 1 * LINK_DIVISIBILITY;
    string public lastRetrievedsubscriberCount;

    event RequestForsubscriberCountFulfilled(
        bytes32 indexed requestId,
        string indexed response
    );

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
    }

    function requestInfo(
        address _oracle,
        string memory _jobId,
        string memory chid
    ) public {
        Chainlink.Request memory req = buildOperatorRequest(
            stringToBytes32(_jobId),
            this.fulfillRequestsubscriberCount.selector
        );

        // Removed the explicit key parameter and handling
        req.add("chid", chid);
        // Continue to make the request to the oracle
        sendOperatorRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    function fulfillRequestsubscriberCount(bytes32 _requestId, string memory _subscriberCount)
        public
        recordChainlinkFulfillment(_requestId)
    {
        emit RequestForsubscriberCountFulfilled(_requestId, _subscriberCount);
        lastRetrievedsubscriberCount = _subscriberCount;
    }

    // The rest of the functions remain unchanged for security reasons
    // withdrawLink, withdrawBalance, cancelRequest

    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
