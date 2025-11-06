import numpy as np
from src.config import N_GRAM_SIZE, LEXICAL_THRESHOLD

def generate_shingles(text, n=N_GRAM_SIZE):
    words = text.split()
    if len(words) < n:
        return set()
    shingles = set()
    for i in range(len(words) - n + 1):
        shingle = " ".join(words[i:i + n])
        shingles.add(shingle)
    return shingles

def jaccard_similarity(set1, set2):
    if not set1 and not set2:
        return 0.0
    union = len(set1.union(set2))
    if union == 0:
        return 0.0
    return len(set1.intersection(set2)) / union

def perform_lexical_check(suspect_chunks, reference_chunks):
    suspect_shingles = [generate_shingles(chunk) for chunk in suspect_chunks]
    reference_shingles = [generate_shingles(chunk) for chunk in reference_chunks]
    lexical_matrix = np.zeros((len(suspect_chunks), len(reference_chunks)))
    print("Performing Lexical (N-Gram/Jaccard) Check...")
    for i, s_set in enumerate(suspect_shingles):
        for j, r_set in enumerate(reference_shingles):
            lexical_matrix[i, j] = jaccard_similarity(s_set, r_set)
    return lexical_matrix

def find_lexical_matches(suspect_chunks, reference_chunks, lexical_matrix, threshold=LEXICAL_THRESHOLD):
    lexical_matches = []
    for i in range(lexical_matrix.shape[0]):
        for j in range(lexical_matrix.shape[1]):
            score = lexical_matrix[i, j]
            if score >= threshold:
                lexical_matches.append({
                    "suspect_chunk_index": i,
                    "reference_chunk_index": j,
                    "similarity_score": score,
                    "type": "LEXICAL (DIRECT/GLOBAL)",
                    "suspect_text": suspect_chunks[i],
                    "reference_text": reference_chunks[j],
                })
    return lexical_matches
