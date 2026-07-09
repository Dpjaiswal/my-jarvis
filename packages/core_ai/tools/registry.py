import time
from langchain.tools import tool

@tool
def get_current_time(location: str = "local") -> str:
    """Returns the current local time."""
    return f"The current time is {time.strftime('%I:%M %p')}."

@tool
def calculate_math(expression: str) -> str:
    """Evaluates a basic math expression (e.g., '2 + 2')."""
    try:
        # Use a safe eval alternative in production. This is for MVP.
        return str(eval(expression, {"__builtins__": None}, {}))
    except Exception as e:
        return f"Error calculating: {e}"

@tool
def save_memory(fact: str) -> str:
    """Saves a permanent fact or preference about the user into long-term memory."""
    try:
        from packages.core_ai.memory.vector_store import add_memory
        add_memory("user_123", fact)
        return "Memory successfully saved."
    except Exception as e:
        return f"Error saving memory: {e}"

# List of available tools for the Agent
ARIA_TOOLS = [get_current_time, calculate_math, save_memory]
