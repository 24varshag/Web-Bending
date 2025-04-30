import pandas as pd
import json

df = pd.read_csv("avatar_transcripts_with_context.csv")

main_chars = ["Aang", "Katara", "Sokka", "Toph", "Zuko", "Iroh"]

df['Character'] = df['Character'].str.strip()

character_stats = {}

total_lines = len(df)
episodes = df[['Season', 'Episode Number']].drop_duplicates()

for char in main_chars:
    char_df = df[df['Character'] == char]
    
    # Episodes present
    episodes_present = char_df[['Season', 'Episode Number']].drop_duplicates()
    num_eps = len(episodes_present)

    # % of total dialogue
    percent_spoken = round(len(char_df) / total_lines * 100, 2)

    # First appearance
    first = char_df.sort_values(['Season', 'Episode Number']).iloc[0]
    first_appearance = f"Season {first['Season']} Ep {first['Episode Number']}: {first['Episode Title']}"

    # Type of bender
    bending_type = {
        'Aang': 'Avatar',
        'Katara': 'Waterbender',
        'Sokka': 'Non-bender',
        'Toph': 'Earthbender',
        'Zuko': 'Firebender',
        'Iroh': 'Firebender',
    }[char]

    character_stats[char.lower()] = {
        "episodes": num_eps,
        "spoken_percent": percent_spoken,
        "first_appearance": first_appearance,
        "bender": bending_type
    }

with open("character_stats.json", "w") as f:
    json.dump(character_stats, f, indent=2)
