from crewai_tools import BaseTool
from lumen_worldcomputer import LumenClient

class LumenHeartbeatTool(BaseTool):
    name: str = "Lumen Heartbeat"
    description: str = "Sends a heartbeat signal to the LUMEN blockchain to prove agent liveness."

    def _run(self, note: str = "working"):
        client = LumenClient() # Automatically loads from environment variables
        tx = client.heartbeat(note)
        return f"Heartbeat sent successfully! Transaction Hash: {tx}"
