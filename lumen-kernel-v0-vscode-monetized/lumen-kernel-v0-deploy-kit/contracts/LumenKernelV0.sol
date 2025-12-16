// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LUMEN Kernel V0 — Global Context Bus
 * @notice Ultra-minimal on-chain kernel for agent civilization:
 *         - Append-only topic logs (sequenced)
 *         - Capability-based write access control
 *         - Emits context pointers (hashes), NOT payloads
 *
 * Monetization (Sustainable Kernel):
 *         - Micro-toll per WRITE_CONTEXT (spam friction + baseline revenue)
 *         - Enterprise fee exemption (Free Pass)
 *         - Accumulate fees in-kernel, owner withdraws to treasury
 *
 * Design invariants:
 * 1) NO payload storage (only hashes/pointers in events)
 * 2) NO subscriber lists on-chain (subscription is off-chain indexing)
 * 3) Append-only sequencing per topic (topicSeq)
 */
contract LumenKernelV0 {
    // ---------------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------------

    /// @dev Permission bitmask for a subject on a topic.
    /// 0x01 = WRITE
    uint8 internal constant PERM_WRITE = 0x01;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    /// @dev Context record emitted as an event (payload lives off-chain).
    event ContextWritten(
        bytes32 indexed topic,
        uint64 indexed seq,
        address indexed author,
        bytes32 payloadHash,
        bytes32 uriHash,
        bytes32 metaHash,
        bytes32 contextId
    );

    event CapabilityGranted(bytes32 indexed topic, address indexed subject, uint8 perms);
    event CapabilityRevoked(bytes32 indexed topic, address indexed subject);
    event TopicPublicWriteSet(bytes32 indexed topic, bool enabled);

    // Revenue / Ops
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event WriteFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);
    event FeeExemptionUpdated(address indexed subject, bool isExempt);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ---------------------------------------------------------------------
    // Storage (minimal)
    // ---------------------------------------------------------------------

    address public owner;
    address public treasury;

    /// @dev Micro-toll required for writeContext (unless exempt).
    uint256 public writeFee;

    /// @dev Enterprise Free Pass: subject => feeExempt
    mapping(address => bool) public feeExempt;

    /// @dev topic => next sequence number (monotonic)
    mapping(bytes32 => uint64) public topicSeq;

    /// @dev topic => subject => perms
    mapping(bytes32 => mapping(address => uint8)) public cap;

    /// @dev topic => whether anyone can write
    mapping(bytes32 => bool) public topicPublicWrite;

    /// @dev anti-replay nonce per author
    mapping(address => uint64) public authorNonce;

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error NotOwner();
    error NotAuthorized();
    error BadNonce();
    error ZeroAddress();
    error InsufficientFee(uint256 required, uint256 sent);
    error NoFees();
    error WithdrawFailed();

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    /// @param _owner initial owner (0 => msg.sender)
    /// @param _treasury fee withdrawal destination (0 => owner)
    /// @param _initialFee initial micro-toll in wei
    constructor(address _owner, address _treasury, uint256 _initialFee) {
        address o = _owner == address(0) ? msg.sender : _owner;
        address t = _treasury == address(0) ? o : _treasury;

        owner = o;
        treasury = t;
        writeFee = _initialFee;

        // owner is exempt by default (admin convenience)
        feeExempt[o] = true;

        emit OwnershipTransferred(address(0), o);
        emit TreasuryUpdated(t);
        emit WriteFeeUpdated(_initialFee);
        emit FeeExemptionUpdated(o, true);
    }

    receive() external payable {
        // Intentionally empty: allows direct ETH top-ups/donations.
    }

    // ---------------------------------------------------------------------
    // Admin (Money & Power)
    // ---------------------------------------------------------------------

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address prev = owner;
        owner = newOwner;

        // Ensure the new owner can operate without fee friction.
        feeExempt[newOwner] = true;
        emit FeeExemptionUpdated(newOwner, true);

        emit OwnershipTransferred(prev, newOwner);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setWriteFee(uint256 _newFee) external onlyOwner {
        writeFee = _newFee;
        emit WriteFeeUpdated(_newFee);
    }

    function setFeeExempt(address _subject, bool _isExempt) external onlyOwner {
        if (_subject == address(0)) revert ZeroAddress();
        feeExempt[_subject] = _isExempt;
        emit FeeExemptionUpdated(_subject, _isExempt);
    }

    /// @notice Withdraw accumulated fees to treasury.
    function withdrawFees() external onlyOwner {
        uint256 bal = address(this).balance;
        if (bal == 0) revert NoFees();

        (bool ok, ) = treasury.call{value: bal}("");
        if (!ok) revert WithdrawFailed();

        emit FeesWithdrawn(treasury, bal);
    }

    /// @notice Grant permissions on a topic to a subject.
    function grantCapability(bytes32 topic, address subject, uint8 perms) external onlyOwner {
        if (subject == address(0)) revert ZeroAddress();
        cap[topic][subject] = perms;
        emit CapabilityGranted(topic, subject, perms);
    }

    /// @notice Revoke a subject's capability on a topic.
    function revokeCapability(bytes32 topic, address subject) external onlyOwner {
        delete cap[topic][subject];
        emit CapabilityRevoked(topic, subject);
    }

    /// @notice If enabled, anyone can write to this topic (still nonce-gated + fee).
    function setTopicPublicWrite(bytes32 topic, bool enabled) external onlyOwner {
        topicPublicWrite[topic] = enabled;
        emit TopicPublicWriteSet(topic, enabled);
    }

    // ---------------------------------------------------------------------
    // Core Opcode: WRITE_CONTEXT (Monetized)
    // ---------------------------------------------------------------------

    /**
     * @notice Write a context pointer to a topic (append-only).
     * @param topic logical channel (e.g., keccak256("LUMEN.TOPIC.MARKETDATA"))
     * @param payloadHash hash of the off-chain payload
     * @param uriHash optional hash of a URI/CID
     * @param metaHash optional hash of metadata (schema/version/etc.)
     * @param nonce must equal current authorNonce[msg.sender], then increments
     */
    function writeContext(
        bytes32 topic,
        bytes32 payloadHash,
        bytes32 uriHash,
        bytes32 metaHash,
        uint64 nonce
    ) external payable returns (uint64 seq, bytes32 contextId) {
        // 1) Fee check (exact to avoid accidental overpay & refund complexity)
        uint256 required = feeExempt[msg.sender] ? 0 : writeFee;
        if (msg.value != required) revert InsufficientFee(required, msg.value);

        // 2) Authorization
        if (!topicPublicWrite[topic]) {
            if ((cap[topic][msg.sender] & PERM_WRITE) != PERM_WRITE) revert NotAuthorized();
        }

        // 3) Nonce gate
        uint64 n = authorNonce[msg.sender];
        if (nonce != n) revert BadNonce();
        unchecked {
            authorNonce[msg.sender] = n + 1;
        }

        // 4) Sequencing
        seq = topicSeq[topic];
        unchecked {
            topicSeq[topic] = seq + 1;
        }

        // 5) Deterministic receipt id
        contextId = keccak256(
            abi.encodePacked(
                block.chainid,
                address(this),
                topic,
                seq,
                msg.sender,
                payloadHash,
                uriHash,
                metaHash
            )
        );

        emit ContextWritten(topic, seq, msg.sender, payloadHash, uriHash, metaHash, contextId);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    function hasWriteCapability(bytes32 topic, address subject) external view returns (bool) {
        if (topicPublicWrite[topic]) return true;
        return (cap[topic][subject] & PERM_WRITE) == PERM_WRITE;
    }

    function getWriteFeeFor(address subject) external view returns (uint256) {
        return feeExempt[subject] ? 0 : writeFee;
    }
}
