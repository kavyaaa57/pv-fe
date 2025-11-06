from spelling_grammar.config import settings

def rate_severity_and_format(raw_text, matches):
    if isinstance(matches, dict) and matches.get("status") == "ERROR":
        return matches

    errors = []
    for match in matches:
        if isinstance(match, dict):
            error_segment = match['error_text']
            errors.append({
                "context_message": match['message'],
                "error_text": error_segment,
                "suggestions": match['replacements'],
                "category": match['category'],
                "offset": match['offset']
            })
        else:
            error_segment = raw_text[match.offset: match.offset + match.errorLength]
            errors.append({
                "context_message": match.message,
                "error_text": error_segment,
                "suggestions": match.replacements[:3],
                "category": match.category,
                "offset": match.offset
            })

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
