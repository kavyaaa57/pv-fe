# spelling_grammar/util/text_cleaner.py

import re

def preprocess_for_grammar(text):
    """
    Performs minor cleaning necessary for accurate grammar/style checking.
    Removes common structural noise that can confuse LanguageTool.
    """
    if not text:
        return ""
    
    # 1. Replace multiple spaces with a single space (common issue from PDF extraction)
    text = re.sub(r'\s+', ' ', text)
    
    # 2. Basic Unicode normalization (removes invisible characters)
    text = text.strip().encode("ascii", "ignore").decode()
    
    return text