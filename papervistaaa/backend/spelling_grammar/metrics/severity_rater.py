# spelling_grammar/metrics/severity_rater.py

from spelling_grammar.config import settings

def rate_severity_and_format(raw_text, matches):
    """
    Calculates error severity based on total count and formats the output.
    Handles both native LanguageTool objects and custom Python dictionaries.
    """
    
    # Check for engine failure
    if isinstance(matches, dict) and matches.get("status") == "ERROR":
         return matches

    errors = []

    # 1. Detailed Error Extraction
    for match in matches:
        
        # Check if the match is a custom dict (from NLTK) or a native object (from LanguageTool)
        if isinstance(match, dict):
            # Handle Custom Error Dictionary structure (our temporal match)
            error_segment = match['error_text']
            
            errors.append({
                "context_message": match['message'],
                "error_text": error_segment,
                "suggestions": match['replacements'],
                "category": match['category'],
                "offset": match['offset'] # CRITICAL: Used for interactive correction
            })
        else:
            # Handle Native LanguageTool Match Object
            error_segment = raw_text[match.offset: match.offset + match.errorLength]
            
            errors.append({
                "context_message": match.message,
                "error_text": error_segment,
                "suggestions": match.replacements[:3],
                "category": match.category,
                "offset": match.offset # CRITICAL: Used for interactive correction
            })

    # 2. Status Determination
    total_errors = len(errors)
    if total_errors == 0:
        status = "SUCCESS"
    elif total_errors < settings.MIN_ERRORS_FOR_MAJOR_FLAG:
        status = "MINOR ISSUES"
    else:
        status = "MAJOR ISSUES"

    return {
        "status": status,
        "total_errors": total_errors,
        "errors": errors
    }