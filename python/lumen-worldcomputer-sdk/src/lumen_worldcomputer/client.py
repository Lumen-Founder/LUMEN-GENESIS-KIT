import os
import time
from web3 import Web3
from eth_account import Account
from .hashing import topic_id, canonical_hash

# Minimal ABI for Kernel V0 interactions
KERNEL_ABI = [{
    "inputs": [
        {"name": "topic", "type": "bytes32"},
        {"name": "payloadHash", "type": "bytes32"},
        {"name": "uriHash", "type": "bytes32"},
        {"name": "metaHash", "type": "bytes32"},
        {"name": "nonce", "type": "uint64"}
    ],
    "name": "writeContext",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [{"name": "addr", "type": "address"}],
    "name": "authorNonce",
    "outputs": [{"name": "", "type": "uint64"}],
    "stateMutability": "view",
    "type": "function"
}]

class LumenClient:
    """
    Main client for interacting with the LUMEN World Computer.
    Handles nonce management, fee estimation, and canonical hashing.
    """
    def __init__(self, private_key=None, rpc_url=None, kernel_addr=None):
        self.pk = private_key or os.getenv("PRIVATE_KEY")
        self.rpc = rpc_url or "https://mainnet.base.org"
        self.kernel_addr = kernel_addr or "0x52078D914CbccD78EE856b37b438818afaB3899c"
        
        self.w3 = Web3(Web3.HTTPProvider(self.rpc))
        self.account = Account.from_key(self.pk) if self.pk else None
        self.contract = self.w3.eth.contract(address=self.kernel_addr, abi=KERNEL_ABI)

    def write(self, topic: str, payload: dict):
        """Writes generic context to the blockchain."""
        if not self.account:
            raise Exception("Private key is required for write operations.")
        
        # 1. Prepare Data
        t_id = topic_id(topic)
        p_hash = canonical_hash(payload)
        
        # 2. Auto-fetch Nonce
        author = self.account.address
        nonce = self.contract.functions.authorNonce(author).call()
        
        # 3. Build Transaction
        tx = self.contract.functions.writeContext(
            bytes.fromhex(t_id[2:]),
            bytes.fromhex(p_hash[2:]),
            bytes([0]*32), # uriHash (empty for v0.1)
            bytes([0]*32), # metaHash (empty for v0.1)
            nonce
        ).build_transaction({
            'from': author,
            'nonce': self.w3.eth.get_transaction_count(author),
            'value': 0, # Assuming fee exemption or free tier for v0.1
            'gasPrice': self.w3.eth.gas_price
        })
        
        # 4. Sign & Send
        signed = self.w3.eth.account.sign_transaction(tx, self.pk)
        tx_hash = self.w3.eth.send_raw_transaction(signed.rawTransaction)
        return tx_hash.hex()

    def heartbeat(self, note="alive"):
        """Sends a standard heartbeat signal."""
        return self.write("lumen.sys.heartbeat", {
            "v": "0.1",
            "kind": "heartbeat",
            "agent": self.account.address,
            "ts": int(time.time()),
            "note": note
        })
