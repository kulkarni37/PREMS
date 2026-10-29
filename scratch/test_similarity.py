import os
import sys
import re
import difflib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

sys.path.append('.')
from scratch.parse_excel import parse_past_projects

STOPWORDS = {
    'a', 'an', 'the', 'of', 'in', 'on', 'for', 'with', 'by', 'at', 'to', 'from',
    'and', 'or', 'is', 'are', 'was', 'were', 'using', 'based', 'via', 'system',
    'application', 'project', 'study', 'approach', 'model', 'technique', 'techniques'
}

def preprocess_text(text):
    if not text:
        return ''
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    words = cleaned.split()
    filtered = [w for w in words if w not in STOPWORDS or len(words) <= 3]
    return ' '.join(filtered) if filtered else cleaned

def calculate_similarity_scores(query_title, past_titles):
    if not query_title or not past_titles:
        return []

    clean_query = preprocess_text(query_title)
    clean_past = [preprocess_text(t) for t in past_titles]

    vectorizer = TfidfVectorizer(ngram_range=(1, 2)).fit([clean_query] + clean_past)
    query_vec = vectorizer.transform([clean_query])
    past_vecs = vectorizer.transform(clean_past)
    cos_sims = cosine_similarity(query_vec, past_vecs)[0]

    results = []
    query_words = set(clean_query.split())

    for i, orig_title in enumerate(past_titles):
        c_title = clean_past[i]
        c_words = set(c_title.split())

        tfidf_score = float(cos_sims[i])
        intersection = query_words.intersection(c_words)
        union = query_words.union(c_words)
        jaccard_score = len(intersection) / len(union) if union else 0.0
        seq_score = difflib.SequenceMatcher(None, clean_query, c_title).ratio()

        combined_score = max(
            tfidf_score * 0.7 + jaccard_score * 0.3,
            jaccard_score * 0.8 + seq_score * 0.2,
            seq_score * 0.85
        )

        score_pct = round(combined_score * 100, 1)

        results.append({
            'index': i,
            'title': orig_title,
            'score': score_pct,
            'tfidf': round(tfidf_score * 100, 1),
            'jaccard': round(jaccard_score * 100, 1),
            'seq': round(seq_score * 100, 1)
        })

    results.sort(key=lambda x: x['score'], reverse=True)
    return results

if __name__ == '__main__':
    projects = parse_past_projects('D:/projectlist 5 year.xlsx')
    titles = [p['title'] for p in projects]

    test_queries = [
        "AI Based Plant Disease Detection",
        "Smart Plant Disease Identification using Deep Learning",
        "Blockchain based Campus Management System",
        "Fake News Detection using Machine Learning",
        "Quantum Computing Supercomputer System"
    ]

    for q in test_queries:
        print(f"\n==========================================")
        print(f"QUERY: '{q}'")
        matches = calculate_similarity_scores(q, titles)
        top = [m for m in matches if m['score'] >= 40.0][:5]
        if top:
            print(f"Found {len(top)} similar projects above threshold (40%):")
            for m in top:
                print(f"  - [{m['score']}%] {m['title']}")
        else:
            print("No similar projects found above 40%.")
