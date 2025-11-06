# spelling_grammar/__init__.py

from .analyzer.linguistic_engine import analyze_text
from .metrics.severity_rater import rate_severity_and_format

def check_spelling_and_grammar(text):
    """
    Public entry point for the grammar checking package.
    Orchestrates the analysis and reporting steps.
    """
    raw_matches = analyze_text(text)
    
    # Handle engine failure case
    if isinstance(raw_matches, dict) and raw_matches.get("status") == "ERROR":
        return raw_matches
        
    return rate_severity_and_format(text, raw_matches)