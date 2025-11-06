# src/config.py - OPTIMIZED FOR HIGH ACCURACY AND COVERAGE



# --- Semantic Detection Parameters (S-BERT) ---

SENTENCE_MODEL_NAME = 'stsb-roberta-large' 

SEMANTIC_THRESHOLD = 0.75  # Cosine similarity score (75%)



# --- Lexical Detection Parameters (Fingerprinting/N-Gram) ---

N_GRAM_SIZE = 5            

LEXICAL_THRESHOLD = 0.50  # Jaccard similarity score (50% is a moderate threshold)



# --- Image Detection Parameters (pHash) ---

IMAGE_HASH_SIZE = 8        

IMAGE_THRESHOLD = 5        # Hamming distance threshold (max difference in bits)



# --- Data Processing Parameters ---


CHUNK_SIZE_SENTENCES = 3




MAX_SEARCH_QUERIES = 10