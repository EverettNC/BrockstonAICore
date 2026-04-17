import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check specific variables
variables_to_check = [
    "BROCKSTON_VISION",
    "ENABLE_VISION",
    "AWS_REGION",
    "ANTHROPIC_API_KEY",
    "PERPLEXITY_API_KEY",
]

print("--- Environment Variable Check ---")
for var in variables_to_check:
    value = os.getenv(var)
    if value:
        # Mask the value for security
        masked_value = value[:4] + "..." + value[-4:] if len(value) > 8 else "****"
        print(f"✅ {var}: LOADED ({masked_value})")
    else:
        print(f"❌ {var}: NOT LOADED")

print("\n--- BROCKSTON Mode Check ---")
print(f"BROCKSTON_MODE: {os.getenv('BROCKSTON_MODE', 'Not Set')}")
