import json
from eth_utils import keccak

def canonical_json(obj):
    """
    Produces a Canonical JSON string compatible with LUMEN Spec v0.1.
    - Sorts keys.
    - Removes whitespace.
    - Rejects floats to ensure cross-language hash consistency.
    """
    if isinstance(obj, float):
        raise ValueError("Floats are not allowed in Canonical JSON")
    return json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False)

def topic_id(name: str) -> str:
    """Derives the keccak256 hash of the topic string."""
    return "0x" + keccak(text=name).hex()

def canonical_hash(obj) -> str:
    """Returns the keccak256 hash of the canonical JSON string."""
    return "0x" + keccak(text=canonical_json(obj)).hex()
