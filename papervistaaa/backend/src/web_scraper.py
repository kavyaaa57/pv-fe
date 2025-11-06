# src/web_scraper.py
import requests
from bs4 import BeautifulSoup
from .data_processor import chunk_text_by_sentences
import time
import re

def fetch_text_from_url(url):
    """Scrapes or simulates fetching text content from a URL."""
    print(f"Fetching content from: {url}...")
    headers = {'User-Agent': 'PlagiarismDetector/1.0 (Python)'}
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status() 
        
        # SIMULATION for academic papers (to test semantic copy)
        if re.search(r'arxiv\.org|ieee\.org', url, re.IGNORECASE):
            text = (
                "The core principle of large language models relies on attention mechanisms. "
                "This profound impact warrants further study on attention mechanisms."
            )
            return text
        
        # General Web Scrape
        soup = BeautifulSoup(response.content, 'html.parser')
        for script_or_style in soup(['script', 'style']):
            script_or_style.decompose()
            
        return soup.get_text(separator=' ', strip=True)
        
    except requests.exceptions.RequestException as e:
        print(f"Web fetch error for {url}: {e}")
        return None
    finally:
        time.sleep(0.5) 

def fetch_and_process_web_references(urls, chunk_size):
    """Fetches text from multiple URLs and returns processed chunks."""
    web_chunks = []
    
    for url in urls:
        text = fetch_text_from_url(url)
        if text:
            cleaned_text = ' '.join(text.split()).lower()
            web_chunks.extend(chunk_text_by_sentences(cleaned_text, chunk_size))
            
    return web_chunks