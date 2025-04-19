import requests 
from bs4 import BeautifulSoup
import re
import csv

BASE_URL = 'https://avatar.fandom.com'

season = 1
episode_number = 0
count = 0

def scrape(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    return soup


def episodeScrape(episode_soup, episode_title):
    global season, episode_number, count 

    
    tables = episode_soup.find_all('table', class_='wikitable')
    print(f"Scraping: {episode_title} | Found {len(tables)} wikitable(s)")
    
    index = 1 if len(tables) == 2 else 0
    currentTable = tables[index]

    # getting the Main, Minor and Antagonists of each epidoe
    context = {
        'Main': [],
        'Minor': [],
        'Antagonists': []
    }

    for cat in context.keys():
        span = episode_soup.find('span', id=cat)
        if span:
            h3 = span.find_parent('h3')
            if h3:
                ul = h3.find_next_sibling('ul')
                if ul:
                    context[cat] = [li.text.strip() for li in ul.find_all('li')]

    # getting the location 
    # TODO - Ill do it soon, but for now assume there is another column with locations for each episode

    # getting dialogue from episdoe
    dialogue_data = []

    for tr in currentTable.find_all('tr'):
        if tr.find('th'):
            character = tr.th.text.strip()
            dialogue = tr.text.replace(character, '', 1).strip()
            dialogue_data.append([
                season, episode_number, episode_title,
                character, dialogue,
                ', '.join(context['Main']),
                ', '.join(context['Minor']),
                ', '.join(context['Antagonists'])
            ])

    # Updating episode number and season 
    if episode_number == 20 and count == 0:        
        episode_number = 1
        season = season + 1
        count = count + 1
    elif episode_number == 20 and count == 1:
        episode_number = 0
        count = count + 1
        season = season + 1
    elif episode_number == 20 and count == 2:
        episode_number = episode_number + 1
    else:
        episode_number = episode_number + 1
    
    print('EPISODE NUMBER: ', episode_number)

    return dialogue_data


if __name__ == '__main__':
    transcript_list_url = f'{BASE_URL}/wiki/Avatar_Wiki:Transcripts'
    soup = scrape(transcript_list_url)
    
    all_dialogues = []
    episode_number = 0
    season = 1

    for item in soup.find_all('a', href=True):
        href = item['href']

         # If the href starts with '/wiki/Transcript:' and doesnt contain '(commentary)' the loop will give us the href with episode names until the last episode Sozin_Comet_Part_4
        if re.match(r'^/wiki/Transcript:', href) and not re.search(r'\(commentary\)', href):
            episode_url = BASE_URL + href
            episode_title = item.text.strip()

            print(f"Fetching episode: {episode_title}")
            episode_soup = scrape(episode_url)
            episode_data = episodeScrape(episode_soup, episode_title)
            all_dialogues.extend(episode_data)

            # Stops after final episode of avatar
            if href == '/wiki/Transcript:Sozin%27s_Comet,_Part_4:_Avatar_Aang':
                break

# Saving to a CSV file
with open('avatar_transcripts_with_context.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        'Season', 'Episode Number', 'Episode Title',
        'Character', 'Dialogue',
        'Main Characters', 'Minor Characters', 'Antagonists'
    ])
    writer.writerows(all_dialogues)

    print(f"\nScraping complete woooo.")

# There is a small bug with i think 3 episodes where the data being scrapped is the deleted scene instead of the episode -  will fix this soon, but unitl then this should work 

# I added main, minor, and antagonist columns, I need to add another section for location, will do that soon!