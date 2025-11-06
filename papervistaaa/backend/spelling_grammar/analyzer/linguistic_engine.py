# spelling_grammar/analyzer/linguistic_engine.py

import language_tool_python
from spelling_grammar.config import settings
from spelling_grammar.util import text_cleaner
import nltk
from nltk.tokenize import word_tokenize
import requests.exceptions # Import to catch ConnectionError
import time # Import for delay

# --- NLTK Data Check (Assumed to be downloaded) ---
try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    pass # Assume data is managed by external download steps

# Define static lists for temporal conflict checking
IRREGULAR_PAST_VERBS = ['ate', 'drank', 'ran', 'slept', 'went', 'saw'] 
FUTURE_MARKERS = ['tomorrow', 'next week', 'soon', 'later']
PAST_MARKERS = ['yesterday', 'ago', 'last night']

# Initialize LanguageTool globally
tool = None
try:
    tool = language_tool_python.LanguageTool(settings.LANGUAGE_CODE)
except Exception as e:
    # Set tool to None if initialization fails (e.g., no Java)
    tool = None


def check_temporal_mismatch(text):
    """Checks explicitly for Past/Future conflicts using NLTK tagging."""
    if not text: return []
        
    try:
        tokens = word_tokenize(text)
        tagged = nltk.pos_tag(tokens)
    except LookupError:
        return [] # Cannot run NLTK check if data is missing
        
    custom_errors = []
    
    for i in range(len(tokens)):
        word, tag = tagged[i]
        
        is_past = (tag == 'VBD' or word.lower() in IRREGULAR_PAST_VERBS)
        has_future_marker = any(marker in w.lower() for w in tokens[max(0, i-5) : min(len(tokens), i+6)] for marker in FUTURE_MARKERS)
        
        # Conflict 1: Past verb + Future marker (e.g., "I ate tomorrow")
        if is_past and has_future_marker:
            offset = text.find(tokens[i]) 
            base_verb = word.lower().replace('ate', 'eat').replace('drank', 'drink') 
            
            custom_errors.append({
                'message': "CRITICAL TENSE MISMATCH: Past action paired with a future time marker.",
                'replacements': [f"will {base_verb}", f"am going to {base_verb}"],
                'offset': offset,
                'error_text': tokens[i],
                'category': 'GRAMMAR'
            })
            
    return custom_errors


def analyze_text(raw_text):
    """
    Applies preprocessing and runs the core LanguageTool check with a connection retry mechanism.
    """
    global tool
    if not tool:
        return {"status": "ERROR", "message": "Grammar tool failed to load. Check Java PATH."}
    
    if not raw_text or len(raw_text.strip()) == 0:
        return []

    cleaned_text = text_cleaner.preprocess_for_grammar(raw_text)
    lt_matches = []
    
    # --- LanguageTool Check with Retry Loop ---
    MAX_RETRIES = 3
    RETRY_DELAY = 3 # Wait 3 seconds to allow Java server to stabilize

    for attempt in range(MAX_RETRIES):
        try:
            print("--- Running Grammar and Spell Check (LanguageTool) ---")
            lt_matches = tool.check(cleaned_text)
            break 
        
        except (requests.exceptions.ConnectionError, ConnectionResetError) as e:
            if attempt < MAX_RETRIES - 1:
                print(f"⚠️ Connection reset error during check. Retrying... (Attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                
                # Crucial step: Attempt to restart the Java server process by re-initializing the tool
                try:
                    tool = language_tool_python.LanguageTool(settings.LANGUAGE_CODE)
                except Exception:
                    print("Could not re-initialize LanguageTool on failed attempt.")
            else:
                print(f"\nCRITICAL FAILURE: Failed to connect after {MAX_RETRIES} retries. Check Java memory/firewall.")
                return {"status": "ERROR", "message": "Server connection failed repeatedly during analysis."}


    # --- Execute Custom Rules ---

    # 2. Custom Temporal Check (Tense/Time Conflict)
    temporal_matches = check_temporal_mismatch(cleaned_text)
    
    # 3. Combine and return all matches
    return lt_matches + temporal_matches