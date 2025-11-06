from sentence_transformers import SentenceTransformer
from src.config import SENTENCE_MODEL_NAME

class TextEncoder:
    def __init__(self, model_name=SENTENCE_MODEL_NAME):
        self.model = self._load_model(model_name)
    
    def _load_model(self, model_name):
        print(f"Loading S-BERT Model: {model_name}...")
        try:
            model = SentenceTransformer(model_name)
            print("Model loaded successfully.")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None

    def get_embeddings(self, texts):
        if not self.model or not texts:
            return None
        print(f"Encoding {len(texts)} chunks...")
        embeddings = self.model.encode(texts, convert_to_tensor=True, show_progress_bar=True)
        return embeddings
