import pandas as pd
import re
import json
from collections import defaultdict, Counter
from nltk.util import ngrams
from nltk.corpus import stopwords
import nltk

# Ensure NLTK stopwords available
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# Load transcripts
df = pd.read_csv('avatar_transcripts_with_context.csv')

# Dialogue cleaner
def clean_dialogue(text):
    text = str(text)
    text = re.sub(r'\[.*?\]', '', text)  # Remove stage directions
    text = text.replace('\n', ' ')  # Normalize newlines
    text = re.sub(r'[^a-zA-Z0-9\s\'\.\!\?]', '', text)  # Allow words, digits, apostrophes, sentence punctuation
    text = re.sub(r'\s+', ' ', text)  # Collapse multiple spaces
    return text.strip().lower()

# Extract n-grams smartly
def extract_ngrams_from_text(text, min_n=3, max_n=5):
    sentences = re.split(r'[.!?]', text)
    phrases = []

    for sentence in sentences:
        tokens = sentence.strip().split()
        if len(tokens) >= min_n:
            for n in range(min_n, max_n+1):
                if len(tokens) >= n:
                    phrases += [' '.join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]
    
    return phrases

# Post-process: remove phrases that are substrings of bigger phrases
def remove_sub_phrases(phrases_with_counts):
    # Sort by length (longest first), and then frequency
    phrases_with_counts.sort(key=lambda x: (-len(x[0].split()), -x[1]))
    final_phrases = []
    phrases_seen = set()

    for phrase, count in phrases_with_counts:
        is_subphrase = False
        for long_phrase, _ in final_phrases:
            if phrase in long_phrase:
                is_subphrase = True
                break
        if not is_subphrase:
            final_phrases.append((phrase, count))

    return final_phrases

# Step 1: Group dialogues
character_season_episode_texts = defaultdict(lambda: defaultdict(lambda: defaultdict(str)))

for _, row in df.iterrows():
    character = row['Character'].strip()
    season = f"Season {row['Season']}"
    episode = f"Episode {row['Episode Number']}"
    
    dialogue = clean_dialogue(row['Dialogue'])
    if not dialogue.strip():
        continue

    character_season_episode_texts[character][season][episode] += " " + dialogue

# Step 2: Extract n-grams
character_top_phrases = {}

for character, seasons in character_season_episode_texts.items():
    character_top_phrases[character] = {}
    all_text = ""

    for season, episodes in seasons.items():
        season_text = ""

        for episode, full_text in episodes.items():
            all_text += " " + full_text
            season_text += " " + full_text

            # Extract n-grams from episode
            phrases = extract_ngrams_from_text(full_text)
            counts = Counter(phrases)
            filtered = [(phrase, count) for phrase, count in counts.items() if count >= 2]
            filtered = remove_sub_phrases(filtered)
            filtered.sort(key=lambda x: x[1], reverse=True)

            character_top_phrases[character][f"{season} - {episode}"] = filtered

        # Season-level n-grams
        phrases = extract_ngrams_from_text(season_text)
        counts = Counter(phrases)
        filtered = [(phrase, count) for phrase, count in counts.items() if count >= 3]
        filtered = remove_sub_phrases(filtered)
        filtered.sort(key=lambda x: x[1], reverse=True)

        character_top_phrases[character][season] = filtered

    # All-show-level n-grams
    phrases = extract_ngrams_from_text(all_text)
    counts = Counter(phrases)
    filtered = [(phrase, count) for phrase, count in counts.items() if count >= 4]
    filtered = remove_sub_phrases(filtered)
    filtered.sort(key=lambda x: x[1], reverse=True)

    character_top_phrases[character]["All"] = filtered

# Step 3: Save as JSON
with open('character_top_phrases.json', 'w', encoding='utf-8') as f:
    json.dump(character_top_phrases, f, ensure_ascii=False, indent=2)

print("Clean character phrases extracted! Ready for visualizationnnn!")
