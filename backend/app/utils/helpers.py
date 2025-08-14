import datetime

def log_error(error_msg: str):
    """Prints a timestamped error message (can later be replaced with proper logging)"""
    print(f"[{datetime.datetime.now()}] ERROR: {error_msg}")

def format_response(data: dict, success: bool = True):
    """Standardizes API responses"""
    return {
        "success": success,
        "data": data,
        "timestamp": str(datetime.datetime.now())
    }
