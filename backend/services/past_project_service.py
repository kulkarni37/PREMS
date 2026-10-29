import os
import re
import difflib
import openpyxl
from datetime import datetime, timezone
from database.db import db
from models.past_project import PastProject
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOPWORDS = {
    'a', 'an', 'the', 'of', 'in', 'on', 'for', 'with', 'by', 'at', 'to', 'from',
    'and', 'or', 'is', 'are', 'was', 'were', 'using', 'based', 'via', 'system',
    'application', 'project', 'study', 'approach', 'model', 'technique', 'techniques'
}

def preprocess_title(text):
    if not text:
        return ''
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', str(text).lower())
    words = cleaned.split()
    filtered = [w for w in words if w not in STOPWORDS or len(words) <= 3]
    return ' '.join(filtered) if filtered else cleaned

def seed_past_projects_from_excel(excel_path=None):
    """
    Parses 'projectlist 5 year.xlsx' and seeds the 'past_projects' MySQL table
    if the table is currently empty.
    """
    try:
        if PastProject.query.count() > 0:
            print("[PAST_PROJECTS] Table already seeded with project records.")
            return True

        possible_paths = [
            excel_path,
            'D:/projectlist 5 year.xlsx',
            os.path.join(os.path.dirname(__file__), '..', 'data', 'projectlist 5 year.xlsx'),
            'projectlist 5 year.xlsx'
        ]

        target_path = None
        for p in possible_paths:
            if p and os.path.exists(p):
                target_path = p
                break

        if not target_path:
            print("[PAST_PROJECTS WARNING] Could not find 'projectlist 5 year.xlsx'. Skipping auto-seed.")
            return False

        wb = openpyxl.load_workbook(target_path)
        inserted_count = 0

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            for r in range(2, ws.max_row + 1):
                c1 = ws.cell(row=r, column=1).value
                c2 = ws.cell(row=r, column=2).value
                c3 = ws.cell(row=r, column=3).value if ws.max_column >= 3 else None

                title = None
                group_no = None
                guide_name = None

                if sheet_name == '2018-22':
                    if c2 and str(c2).strip():
                        title = str(c2).strip()
                    elif c1 and str(c1).strip() and not str(c1).strip().isdigit():
                        title = str(c1).strip()
                    
                    if c1 and str(c1).strip():
                        c1_str = str(c1).strip()
                        if c1_str.isdigit():
                            group_no = f"G{c1_str}"
                        elif c1_str.startswith('G'):
                            group_no = c1_str

                elif sheet_name == '2019-23':
                    if c1 and str(c1).strip():
                        group_no = str(c1).strip()
                    if c2 and str(c2).strip():
                        title = str(c2).strip()
                    if c3 and str(c3).strip():
                        guide_name = ' '.join(str(c3).strip().split())

                else: # 2020-24, 2021-25, 2022-25
                    if c1 and str(c1).strip():
                        group_no = str(c1).strip()
                    if c2 and str(c2).strip():
                        title = str(c2).strip()

                if title:
                    clean_title = ' '.join(str(title).split()).strip('\"\'')
                    if clean_title and clean_title.lower() not in ['title of project', 'project title', 'slno', 'group no.', 'guide']:
                        past_record = PastProject(
                            project_title=clean_title,
                            source_period=sheet_name,
                            group_no=group_no,
                            guide_name=guide_name
                        )
                        db.session.add(past_record)
                        inserted_count += 1

        db.session.commit()
        print(f"[PAST_PROJECTS SUCCESS] Imported {inserted_count} past projects from Excel into MySQL database.")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"[PAST_PROJECTS ERROR] Error seeding past projects: {e}")
        return False

def check_project_similarity(proposed_title, threshold=40.0):
    """
    Performs semantic similarity check between proposed_title and all records in past_projects repository.
    Returns:
    {
        'is_similar': bool,
        'threshold': threshold,
        'matches': [
            {
                'id': int,
                'project_title': str,
                'source_period': str,
                'group_no': str or None,
                'guide_name': str or None,
                'similarity_score': float
            }
        ]
    }
    """
    if not proposed_title or not str(proposed_title).strip():
        return {'is_similar': False, 'threshold': threshold, 'matches': []}

    query_raw = str(proposed_title).strip()
    clean_query = preprocess_title(query_raw)
    if not clean_query:
        clean_query = query_raw.lower()

    all_past_records = PastProject.query.all()
    if not all_past_records:
        return {'is_similar': False, 'threshold': threshold, 'matches': []}

    past_titles_raw = [r.project_title for r in all_past_records]
    clean_past = [preprocess_title(t) or t.lower() for t in past_titles_raw]

    # TF-IDF Cosine Similarity
    vectorizer = TfidfVectorizer(ngram_range=(1, 2)).fit([clean_query] + clean_past)
    query_vec = vectorizer.transform([clean_query])
    past_vecs = vectorizer.transform(clean_past)
    cos_sims = cosine_similarity(query_vec, past_vecs)[0]

    matches = []
    query_words = set(clean_query.split())

    for i, record in enumerate(all_past_records):
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

        if score_pct >= threshold:
            matches.append({
                'id': record.id,
                'project_title': record.project_title,
                'source_period': record.source_period,
                'group_no': record.group_no,
                'guide_name': record.guide_name,
                'similarity_score': score_pct
            })

    # Sort descending by similarity score
    matches.sort(key=lambda x: x['similarity_score'], reverse=True)

    return {
        'is_similar': len(matches) > 0,
        'threshold': threshold,
        'matches': matches
    }

def add_completed_project_to_repository(team):
    """
    Adds a completed project to the PastProject repository upon completion.
    """
    if not team or not team.title:
        return None

    existing = PastProject.query.filter_by(project_title=team.title.strip()).first()
    if existing:
        return existing

    current_yr = datetime.now().year
    source_period = f"{current_yr}-{str(current_yr + 4)[-2:]}"

    guide_name = None
    if team.guide_id:
        from models.user import User
        g_user = User.query.get(team.guide_id)
        if g_user:
            guide_name = g_user.full_name

    new_past = PastProject(
        project_title=team.title.strip(),
        source_period=source_period,
        group_no=team.team_id,
        guide_name=guide_name
    )
    db.session.add(new_past)
    db.session.commit()
    print(f"[PAST_PROJECTS] Added completed project '{team.title}' to repository.")
    return new_past
