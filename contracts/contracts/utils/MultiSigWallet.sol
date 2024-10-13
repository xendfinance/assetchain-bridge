// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

contract MultiSigWallet {
    address[] public approvers;
    uint public quorum;
    string public name;

    // Transfer struct
    // Called by one of the approver addressese to suggest a transfer of tokens
    struct Transfer {
        uint id;
        uint amount;
        address payable to;
        uint approvals;
        bool sent;
    }
    // Transfer struct
    struct Transaction {
        uint id;
        address to;
        bytes data;
        uint approvals;
        bool executed;
    }

    // mapping transfer to go along with each transaction
    Transfer[] public transfers;
    mapping(uint => Transaction) transactions;

    uint public transactionCount = 1;

    // Transfer approval mapping
    mapping(address => mapping(uint => bool)) public approvals;
    mapping(address => mapping(uint => bool)) public transactionapprovals;
    // contract events events
    event TransferCreated(uint id, uint amount, address indexed to);
    event TransferApproved(uint indexed id, address indexed approver);
    event TransferSent(uint indexed id, uint amount, address indexed to);
    event TransactionCreated(uint indexed id, address indexed to, bytes data);
    event TransactionApproved(uint indexed id, address indexed approver);
    event TransactionExecuted(uint indexed id, address indexed to, bytes data);

    // Instantiate at start - list of approvers
    // Amount that will be needed for quorum
    constructor(address[] memory _approvers, uint _quorum, string memory _name) {
        approvers = _approvers;
        quorum = _quorum;
        name = _name;
    }

    // return the list of addressess that can approve trandactions
    function getApprovers() external view returns (address[] memory) {
        return approvers;
    }

    // return list of transfers
    function getTransfers() external view returns (Transfer[] memory) {
        return transfers;
    }

    // generate trandfer when called by apporving address
    function createTransfer(
        uint amount,
        address payable to
    ) external onlyApprover {
        transfers.push(Transfer(transfers.length, amount, to, 0, false));
        emit TransferCreated(transfers.length - 1, amount, to);
    }

    // Approve each transfer
    function approveTransfer(uint id) external onlyApprover {
        // require checks for any double spend or call
        require(transfers[id].sent == false, "Transfer has already been sent");
        require(
            approvals[msg.sender][id] == false,
            "cannot approve transfer twice"
        );

        approvals[msg.sender][id] = true; // change id = true
        transfers[id].approvals++; // increment number of approvals

        // if the transfer approval is equal or more than needed
        if (transfers[id].approvals >= quorum) {
            transfers[id].sent = true; // mark that transfer is sent
            address payable to = transfers[id].to; // send payment to address given
            uint amount = transfers[id].amount; // send amount provided
            to.transfer(amount); // transfer - 'tranfer' is a Solidity function
            emit TransferSent(id, amount, to);
        }
    }

    function createTransaction(
        address to,
        bytes calldata data
    ) external onlyApprover {
        transactions[transactionCount] = Transaction({
            id: transactionCount,
            to: to,
            data: data,
            approvals: 1,
            executed: false
        });
        transactionapprovals[msg.sender][transactionCount] = true;
        emit TransactionCreated(transactionCount, to, data);
        transactionCount++;
    }

    function getTransaction(
        uint id
    ) external view returns (Transaction memory) {
        return transactions[id];
    }

    function approveTransaction(uint id) external onlyApprover {
        require(transactions[id].executed == false, "Transaction has already been executed");
        require(transactionapprovals[msg.sender][id] == false, "Cannot approve transaction twice");

        transactionapprovals[msg.sender][id] = true;
        transactions[id].approvals++;

        emit TransactionApproved(id, msg.sender);

        if (transactions[id].approvals >= quorum) {
            transactions[id].executed = true;
            (bool success, ) = transactions[id].to.call(transactions[id].data);
            require(success, "Transaction execution failed");
            emit TransactionExecuted(id, transactions[id].to, transactions[id].data);
        }
    }

    // Allow contract to receive funds
    // Solidity key word function
    receive() external payable {}

    // Access Control Modifier to attach to create and approve transfer functions
    modifier onlyApprover() {
        bool allowed = false;
        for (uint i = 0; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed == true, "only approver allowed");
        _;
    }
}
