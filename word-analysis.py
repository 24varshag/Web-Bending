import pandas as pd
import re
import string
import nltk
import json
from collections import Counter, defaultdict
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk import ngrams


# Setup
nltk.download('punkt_tab')
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# Set phrase length parameters
MIN_NGRAM = 3
MAX_NGRAM = 6
MIN_COUNT = 5


# --- Custom Excludes (If we want to. Could also be made into a toggleable feature) ---
EXCLUDE_WORDS = {
    #'aang', 'katara', 'zuko', 'sokka', 'appa', 'momo',
    #'avatar', 'uncle', 'iroh', 'toph', 'azula',
    # Add more terms as needed
}


# --- Helpers ---
def remove_stage_directions(text):
    """Remove content inside square brackets [like this] to avoid counting wrylie words."""
    return re.sub(r'\[.*?\]', '', text)

def normalize_text(text):
    """Lowercase, remove punctuation, tokenize, and remove stopwords."""
    text = remove_stage_directions(text)
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = word_tokenize(text)
    return [
        word for word in tokens 
        if word.isalpha() and word not in stop_words and word not in EXCLUDE_WORDS
    ]

def get_ngrams(tokens, n):
    return [' '.join(gram) for gram in ngrams(tokens, n)]


# --- Load Data ---
df = pd.read_csv('avatar_transcripts_with_context.csv')


# --- Global Word Count ---
global_words = []
global_trigrams = []
global_phrases = Counter()

character_word_counts = defaultdict(Counter)
character_bigrams = defaultdict(Counter)
character_trigrams = defaultdict(Counter)

# --- Process All Dialogue ---

for _, row in df.iterrows():
    dialogue = row['Dialogue']
    character = row['Character']

    if isinstance(dialogue, str):
        tokens = normalize_text(dialogue)

        # Global word count
        global_words.extend(tokens)

        # Per-character counts
        character_word_counts[character].update(tokens)
        character_bigrams[character].update(get_ngrams(tokens, 2))
        character_trigrams[character].update(get_ngrams(tokens, 3))

        # Multi-word phrase tracking (3–6 grams)
        for n in range(3, 7):  # 3 to 6 words
            phrase_list = get_ngrams(tokens, n)
            global_phrases.update(phrase_list)

# --- Global Word Count Export ---

global_word_counts = Counter(global_words)
top_global = [{"text": word, "value": count} for word, count in global_word_counts.most_common(100)]

with open("top_global_words.json", "w", encoding="utf-8") as f:
    json.dump(top_global, f, indent=2)

# --- Per-Character Word Frequencies ---

character_top_words = {
    character: counter.most_common(50)
    for character, counter in character_word_counts.items()
}

with open("character_top_words.json", "w", encoding="utf-8") as f:
    json.dump(character_top_words, f, indent=2)

# --- Bigrams and Trigrams ---

character_top_bigrams = {
    character: bigrams.most_common(30)
    for character, bigrams in character_bigrams.items()
}
character_top_trigrams = {
    character: trigrams.most_common(30)
    for character, trigrams in character_trigrams.items()
}

with open("character_bigrams.json", "w", encoding="utf-8") as f:
    json.dump(character_top_bigrams, f, indent=2)

with open("character_trigrams.json", "w", encoding="utf-8") as f:
    json.dump(character_top_trigrams, f, indent=2)

# --- Variable-length Phrase Extraction (3+ words, freq ≥ 4) ---

MIN_COUNT = 4
frequent_phrases = [
    {"text": phrase, "value": count}
    for phrase, count in global_phrases.items()
    if count >= MIN_COUNT
]

frequent_phrases.sort(key=lambda x: x['value'], reverse=True)

with open("frequent_phrases_3plus.json", "w", encoding="utf-8") as f:
    json.dump(frequent_phrases, f, indent=2)

# --- Summary Output ---

print("Exported files:")
print("- top_global_words.json")
print("- character_top_words.json")
print("- character_bigrams.json")
print("- character_trigrams.json")
print("- frequent_phrases_3plus.json")
print(f"Total frequent multi-word phrases (3-6 words, used ≥{MIN_COUNT} times): {len(frequent_phrases)}")
