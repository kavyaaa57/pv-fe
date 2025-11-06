# src/data_processor.py
import PyPDF2
from nltk.tokenize import sent_tokenize
import nltk
import os
import re

try:
    # Ensure NLTK punkt is available
    nltk.data.find('tokenizers/punkt')
except nltk.downloader.DownloadError:
    nltk.download('punkt')

def extract_text_from_pdf(filepath):
    """Extracts text from a PDF file."""
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
    """Tokenizes text into sentences and groups them into chunks for comparison."""
    sentences = sent_tokenize(text)
    chunks = []
    for i in range(0, len(sentences), chunk_size):
        chunk = " ".join(sentences[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def process_file_to_chunks(filepath, chunk_size):
    """Master function to process various file types into text chunks."""
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
    
    # Basic cleaning: remove extra whitespace and convert to lowercase
    cleaned_text = ' '.join(raw_text.split()).lower()
    
    # Remove common non-essential characters (like line numbers, extra punctuation)
    cleaned_text = re.sub(r'[^a-zA-Z0-9\s.,;\'"-]', '', cleaned_text)
    
    return chunk_text_by_sentences(cleaned_text, chunk_size)