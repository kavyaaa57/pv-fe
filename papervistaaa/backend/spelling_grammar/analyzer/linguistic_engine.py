import language_tool_python
from spelling_grammar.config import settings
from spelling_grammar.util import text_cleaner
import nltk
from nltk.tokenize import word_tokenize
import requests.exceptions
import time

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    pass

IRREGULAR_PAST_VERBS = ['ate', 'drank', 'ran', 'slept', 'went', 'saw']
FUTURE_MARKERS = ['tomorrow', 'next week', 'soon', 'later']
PAST_MARKERS = ['yesterday', 'ago', 'last night']

tool = None
try:
    tool = language_tool_python.LanguageTool(settings.LANGUAGE_CODE)
except Exception:
    tool = None

def check_temporal_mismatch(text):
    if not text:
        return []
    try:
        tokens = word_tokenize(text)
        tagged = nltk.pos_tag(tokens)
    except LookupError:
        return []
    custom_errors = []
    for i in range(len(tokens)):
        word, tag = tagged[i]
        is_past = (tag == 'VBD' or word.lower() in IRREGULAR_PAST_VERBS)
        has_future_marker = any(marker in w.lower() for w in tokens[max(0, i - 5):min(len(tokens), i + 6)] for marker in FUTURE_MARKERS)
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
    global tool
    if not tool:
        return {"status": "ERROR", "message": "Grammar tool failed to load. Check Java PATH."}
    if not raw_text or len(raw_text.strip()) == 0:
        return []
    cleaned_text = text_cleaner.preprocess_for_grammar(raw_text)
    lt_matches = []
    MAX_RETRIES = 3
    RETRY_DELAY = 3
    for attempt in range(MAX_RETRIES):
        try:
            print("Running Grammar and Spell Check (LanguageTool)")
            lt_matches = tool.check(cleaned_text)
            break
        except (requests.exceptions.ConnectionError, ConnectionResetError):
            if attempt < MAX_RETRIES - 1:
                print(f"Connection reset error during check. Retrying... (Attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                try:
                    tool = language_tool_python.LanguageTool(settings.LANGUAGE_CODE)
                except Exception:
                    print("Could not re-initialize LanguageTool on failed attempt.")
            else:
                print(f"CRITICAL FAILURE: Failed to connect after {MAX_RETRIES} retries. Check Java memory/firewall.")
                return {"status": "ERROR", "message": "Server connection failed repeatedly during analysis."}
    temporal_matches = check_temporal_mismatch(cleaned_text)
    return lt_matches + temporal_matches
