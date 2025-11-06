from PIL import Image
import imagehash
import os
from src.config import IMAGE_HASH_SIZE, IMAGE_THRESHOLD

def check_image_plagiarism(suspect_file_path, reference_image_paths):
    results = []
    if not os.path.exists(suspect_file_path):
        return "Suspect file not found. Skipping visual check."
    try:
        img_suspect = Image.open(suspect_file_path)
        hash_suspect = imagehash.phash(img_suspect, hash_size=IMAGE_HASH_SIZE)
    except Exception:
        return "Suspect file is not an image (or file not found). Skipping visual check."
    for ref_path in reference_image_paths:
        if not os.path.exists(ref_path):
            continue
        try:
            img_ref = Image.open(ref_path)
            hash_ref = imagehash.phash(img_ref, hash_size=IMAGE_HASH_SIZE)
            distance = hash_suspect - hash_ref
            max_distance = IMAGE_HASH_SIZE**2
            similarity = 1.0 - (distance / max_distance)
            status = "NO PLAGIARISM DETECTED"
            if distance <= IMAGE_THRESHOLD:
                status = "IMAGE PLAGIARISM DETECTED"
            results.append({
                "reference_file": os.path.basename(ref_path),
                "distance": distance,
                "similarity": similarity,
                "status": status
            })
        except Exception:
            continue
    if not results:
        return "Image Check: No valid image references were successfully compared."
    return results
