# spelling_grammar/config/settings.py

# --- Linguistic Parameters ---
LANGUAGE_CODE = 'en-US'  # Defines the dictionary and rule set (e.g., 'en-US', 'en-GB')

# --- Severity and Threshold Parameters ---
MIN_ERRORS_FOR_MAJOR_FLAG = 5 # Flag as MAJOR ISSUES if total errors exceed this count.
WORDS_PER_CHUNK_THRESHOLD = 20 # Minimum words per segment to run a specific style check.