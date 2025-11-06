from sentence_transformers import util
from src.config import SEMANTIC_THRESHOLD
import torch

def compare_semantic_embeddings(suspect_embeddings, reference_embeddings):
    cosine_scores = util.cos_sim(suspect_embeddings, reference_embeddings)
    return cosine_scores

def find_semantic_matches(suspect_chunks, reference_chunks, similarity_matrix, threshold=SEMANTIC_THRESHOLD):
    semantic_matches = []
    for i in range(similarity_matrix.size(0)):
        for j in range(similarity_matrix.size(1)):
            score = similarity_matrix[i][j].item()
            if score >= threshold:
                semantic_matches.append({
                    "suspect_chunk_index": i,
                    "reference_chunk_index": j,
                    "similarity_score": score,
                    "type": "SEMANTIC (PARAPHRASING)",
                    "suspect_text": suspect_chunks[i],
                    "reference_text": reference_chunks[j],
                })
    return semantic_matches

def generate_full_report(semantic_matches, lexical_matches, total_suspect_chunks):
    all_matches = semantic_matches + lexical_matches
    if not all_matches:
        print("Plagiarism Status: NO PLAGIARISM DETECTED")
        return ""
    plagiarized_chunks = set([m['suspect_chunk_index'] for m in all_matches])
    plagiarism_ratio = len(plagiarized_chunks) / total_suspect_chunks
    print(f"Plagiarism Likely: {len(plagiarized_chunks)}/{total_suspect_chunks} chunks flagged")
    print(f"Plagiarism Coverage Ratio: {plagiarism_ratio * 100:.2f}%")
    print("Detailed Matches (Top 5 by Score):")
    top_matches = sorted(all_matches, key=lambda x: x['similarity_score'], reverse=True)[:5]
    for match in top_matches:
        score_type = match['type']
        if match['similarity_score'] > 0.95 and match['type'] == 'LEXICAL (DIRECT/GLOBAL)':
            score_type = "GLOBAL/DIRECT"
        print(f"\nScore: {match['similarity_score'] * 100:.2f}% ({score_type})")
        print(f"Suspect (Chunk {match['suspect_chunk_index'] + 1}): \"{match['suspect_text'][:80]}...\"")
        print(f"Source (Chunk {match['reference_chunk_index'] + 1}): \"{match['reference_text'][:80]}...\"")
    return ""
