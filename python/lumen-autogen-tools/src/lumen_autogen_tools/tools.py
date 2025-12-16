from lumen_worldcomputer import LumenClient

def register_lumen(agent, executor):
    """
    Registers LUMEN tools (Heartbeat, etc.) to an AutoGen agent.
    """
    client = LumenClient()

    def heartbeat(note: str) -> str:
        """Sends a heartbeat to the LUMEN blockchain."""
        tx = client.heartbeat(note)
        return f"Heartbeat confirmed. Tx: {tx}"

    # Auto-register functions for AutoGen
    for func in [heartbeat]:
        agent.register_for_llm(name=func.__name__, description=func.__doc__)(func)
        executor.register_for_execution(name=func.__name__)(func)
