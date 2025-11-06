from googleapiclient.discovery import build
import random

API_KEY = "AIzaSyAHYEq-cGRYI_O-xUqwYyfVpusr0GCCQL8"
CSE_ID = "020bea6ec470c4189"
MAX_SEARCH_RESULTS_PER_QUERY = 5
NUM_QUERIES_PER_DOCUMENT = 3

def generate_search_queries(chunks):
    if not chunks:
        return []
    query_candidates = []
    if len(chunks) > 0:
        query_candidates.append(chunks[0])
    if len(chunks) > 1:
        query_candidates.append(random.choice(chunks[1:]))
    if len(chunks) > 2:
        query_candidates.append(chunks[-1])
    return list(set([q[:100] for q in query_candidates]))

def fetch_web_results(suspect_chunks):
    search_terms = generate_search_queries(suspect_chunks)
    service = build("customsearch", "v1", developerKey=API_KEY)
    all_urls = set()
    print(f"\n[STEP 2] Running {len(search_terms)} Google Search Queries...")
    for term in search_terms:
        try:
            res = service.cse().list(
                q=term,
                cx=CSE_ID,
                num=MAX_SEARCH_RESULTS_PER_QUERY
            ).execute()
            if 'items' in res:
                for item in res['items']:
                    all_urls.add(item['link'])
        except Exception as e:
            print(f" API Error during search for '{term[:30]}...': {e}")
            break
    print(f"Found {len(all_urls)} external source URLs for comparison.")
    return list(all_urls)
