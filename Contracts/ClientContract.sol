// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract ConsumerContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = 1 * LINK_DIVISIBILITY; // 1 * 10**18
    string public lastRetrievedsubscriberCount;

    event RequestForsubscriberCountFulfilled(
        bytes32 indexed requestId,
        string indexed response
    );

    /**
     *  Sepholia
     *@dev LINK address in Sepholia network: 0x779877A7B0D9E8603169DdbD7836e478b4624789
     * @dev Check https://docs.chain.link/docs/link-token-contracts/ for LINK address for the right network
     */
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
    }

    function requestInfo(
        address _oracle,
        string memory _jobId,
        string memory chid,
        string memory key
    ) public onlyOwner {
        Chainlink.Request memory req = buildOperatorRequest(
            stringToBytes32(_jobId),
            this.fulfillRequestsubscriberCount.selector
        );

        req.add("chid", chid);
        req.add("key", key);
        sendOperatorRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    function fulfillRequestsubscriberCount(bytes32 _requestId, string memory _subscriberCount)
        public
        recordChainlinkFulfillment(_requestId)
    {
        emit RequestForsubscriberCountFulfilled(_requestId, _subscriberCount);
        lastRetrievedsubscriberCount = _subscriberCount;
    }

    /*
    ========= UTILITY FUNCTIONS ==========
    */

    function contractBalances()
        public
        view
        returns (uint256 eth, uint256 link)
    {
        eth = address(this).balance;

        LinkTokenInterface linkContract = LinkTokenInterface(
            chainlinkTokenAddress()
        );
        link = linkContract.balanceOf(address(this));
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer Link"
        );
    }

    function withdrawBalance() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function cancelRequest(
        bytes32 _requestId,
        uint256 _payment,
        bytes4 _callbackFunctionId,
        uint256 _expiration
    ) public onlyOwner {
        cancelChainlinkRequest(
            _requestId,
            _payment,
            _callbackFunctionId,
            _expiration
        );
    }

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
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }
}