import requests 
from bs4 import BeautifulSoup
import re
import csv

BASE_URL = 'https://avatar.fandom.com'

def scrape(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    return soup

def episodeScrape(episode_soup, episode_title):
    tables = episode_soup.find_all('table', class_='wikitable')
    print(f"Scraping: {episode_title} | Found {len(tables)} wikitable(s)")

    index = 0
    if len(tables) == 2:
        index = 1

    dialogue_data = []

    for tr in tables[index].find_all('tr'):
        if tr.find('th'):
            character = tr.th.text.strip()
            dialogue = tr.text.replace(character, '', 1).strip()
            dialogue_data.append([episode_title, character, dialogue])

    return dialogue_data

if __name__ == '__main__':
    transcript_list_url = f'{BASE_URL}/wiki/Avatar_Wiki:Transcripts'
    soup = scrape(transcript_list_url)
    
    all_dialogues = []

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

    # Saving to CSV
    with open('avatar_transcripts.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Episode', 'Character', 'Dialogue'])  # header
        writer.writerows(all_dialogues)

    print(f"\nScraping complete woooo.")

# There is a small bug with i think 3 episodes where the data being scrapped is the deleted scene instead of the episode -  will fix this soon, but unitl then this should work 

# Im thinking of adding another csv with season, episode, locations, main chars, antagonist, minor characters - will do that soon too
