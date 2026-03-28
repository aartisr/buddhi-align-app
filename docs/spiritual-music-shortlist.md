# Spiritual and Calming Track Shortlist (20 candidates)

Date: 2026-03-28
Goal: soothing, encouraging, blissful background options suitable for Buddhi Align mood.

## How to use this list
1. Open each track page and confirm current license details.
2. Download the audio file from the provider page.
3. Host approved files in your own storage/CDN for reliability.
4. Add direct audio URLs to `NEXT_PUBLIC_BGM_URLS`.

## Candidate tracks (Pixabay pages)

| # | Track | Mood fit | Source page |
|---|---|---|---|
| 1 | Spiritual Meditation | Blissful, meditative | https://pixabay.com/music/meditationspiritual-meditation-463389/ |
| 2 | Meditation | Calm, reflective | https://pixabay.com/music/meditationspiritual-meditation-491684/ |
| 3 | Meditation | Soft, peaceful | https://pixabay.com/music/meditationspiritual-meditation-495611/ |
| 4 | Meditation Meditation | Deep calming | https://pixabay.com/music/meditationspiritual-meditation-meditation-482096/ |
| 5 | Meditation | Ambient healing | https://pixabay.com/music/meditationspiritual-meditation-471136/ |
| 6 | Meditation (Ambient) | Gentle background | https://pixabay.com/music/ambient-meditation-504885/ |
| 7 | Meditation (Ambient) | Slow serenity | https://pixabay.com/music/ambient-meditation-490007/ |
| 8 | Meditation Meditative | Centering | https://pixabay.com/music/meditationspiritual-meditation-meditative-482095/ |
| 9 | Meditation Music | Encouraging calm | https://pixabay.com/music/meditationspiritual-meditation-music-322801/ |
| 10 | Meditation Background | Neutral peaceful bed | https://pixabay.com/music/ambient-meditation-background-409198/ |
| 11 | Meditation - Meditation Music | Uplifting meditative | https://pixabay.com/music/meditationspiritual-meditation-meditation-music-452572/ |
| 12 | Meditation Background | Supportive ambience | https://pixabay.com/music/meditationspiritual-meditation-background-443554/ |
| 13 | Meditation Music | Gentle inspiration | https://pixabay.com/music/meditationspiritual-meditation-music-338902/ |
| 14 | Meditation Background | Calm pulse | https://pixabay.com/music/meditationspiritual-meditation-background-434654/ |
| 15 | Meditation Flute | Spiritual, airy | https://pixabay.com/music/meditationspiritual-meditation-flute-455457/ |
| 16 | Meditation Yoga Relaxing Music | Yoga flow, peaceful | https://pixabay.com/music/ambient-meditation-yoga-relaxing-music-380330/ |
| 17 | Meditation | Soft ambient | https://pixabay.com/music/ambient-meditation-495676/ |
| 18 | Meditation Music | Soothing continuity | https://pixabay.com/music/ambient-meditation-music-409195/ |
| 19 | Meditation Background | Light spiritual bed | https://pixabay.com/music/meditationspiritual-meditation-background-456658/ |
| 20 | Meditative Meditation | Breath-focused calm | https://pixabay.com/music/meditationspiritual-meditative-meditation-482094/ |

## Suggested initial rotation (3-track starter)
- https://pixabay.com/music/meditationspiritual-meditation-463389/
- https://pixabay.com/music/meditationspiritual-meditation-flute-455457/
- https://pixabay.com/music/ambient-meditation-yoga-relaxing-music-380330/

## Convert to direct audio URLs (required for app playback)
The app expects direct audio files, not track page links.

1. Open each Pixabay track page in your browser.
2. Click Download for the track quality you want.
3. In browser downloads or the network panel, copy the final `https://cdn.pixabay.com/audio/...mp3` URL.
4. Add those direct URLs to `NEXT_PUBLIC_BGM_URLS`.

Example format:

```bash
NEXT_PUBLIC_BGM_URLS=https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae3b6.mp3,https://cdn.pixabay.com/audio/xxxx/xx/xx/audio_example_1.mp3,https://cdn.pixabay.com/audio/xxxx/xx/xx/audio_example_2.mp3
```

Note: automated extraction from this coding environment can fail because provider links are often generated dynamically and protected against bot scraping.

## Recommended next curation step
Run a 10-minute internal listening pass and score each candidate from 1-5 on:
- Soothe
- Encourage
- Blissful
- Distractiveness (lower is better)

Promote the top 3 to top 5 tracks into production rotation.
