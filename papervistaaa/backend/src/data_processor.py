import PyPDF2
from nltk.tokenize import sent_tokenize
import nltk
import os
import re

try:
    nltk.data.find('tokenizers/punkt')
except nltk.downloader.DownloadError:
    nltk.download('punkt')

def extract_text_from_pdf(filepath):
    text = ""
    try:
        with open(filepath, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() or ''
        return text
    except Exception as e:
        print(f"Error processing PDF {filepath}: {e}")
        return ""

def chunk_text_by_sentences(text, chunk_size):
    sentences = sent_tokenize(text)
    chunks = []
    for i in range(0, len(sentences), chunk_size):
        chunk = " ".join(sentences[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def process_file_to_chunks(filepath, chunk_size):
    extension = os.path.splitext(filepath)[1].lower()
    raw_text = ""
    if extension == '.pdf':
        raw_text = extract_text_from_pdf(filepath)
    elif extension == '.txt':
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                raw_text = f.read()
        except:
            return []
    cleaned_text = ' '.join(raw_text.split()).lower()
    cleaned_text = re.sub(r'[^a-zA-Z0-9\s.,;\'"-]', '', cleaned_text)
    return chunk_text_by_sentences(cleaned_text, chunk_size)
