import { MediaItem } from '../types';

export const SAMPLE_SRT_ENG = `1
00:00:01,000 --> 00:00:04,500
Welcome to MB Player India - India's Smart Media Engine!

2
00:00:05,000 --> 00:00:08,200
Experience ultra-smooth hardware playback and 200% sound boost.

3
00:00:09,000 --> 00:00:13,000
Swipe left for brightness and right for volume control. Enjoy!`;

export const SAMPLE_SRT_HIN = `1
00:00:01,000 --> 00:00:04,500
एमबी प्लेयर इंडिया में आपका स्वागत है!

2
00:00:05,000 --> 00:00:08,200
सुपर स्मूथ एचडी वीडियो और 200% साउंड बूस्टर के साथ देखें।

3
00:00:09,000 --> 00:00:13,000
स्क्रीन पर स्वाइप करके वॉल्यूम और ब्राइटनेस कंट्रोल करें।`;

export const INITIAL_SAMPLE_MEDIA: MediaItem[] = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny 4K HDR Sample',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    folderName: 'Movies',
    duration: 596, // 9m 56s
    size: 158000000, // ~158 MB
    format: 'MP4',
    resolution: '1080p Ultra HD',
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    lastPlayedAt: Date.now() - 1000 * 60 * 30,
    progressSeconds: 125,
    isFavorite: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    subtitles: [
      { id: 'sub-en', label: 'English (Custom)', language: 'en', content: SAMPLE_SRT_ENG },
      { id: 'sub-hi', label: 'हिंदी (Hindi)', language: 'hi', content: SAMPLE_SRT_HIN }
    ]
  },
  {
    id: 'sample-2',
    title: 'Tears of Steel Sci-Fi Trailer',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'video',
    folderName: 'Downloads',
    duration: 734, // 12m 14s
    size: 210000000,
    format: 'MKV',
    resolution: '4K Cinema',
    addedAt: Date.now() - 1000 * 60 * 60 * 12,
    isFavorite: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    subtitles: [
      { id: 'sub-en-2', label: 'English', language: 'en', content: SAMPLE_SRT_ENG }
    ]
  },
  {
    id: 'sample-3',
    title: 'WhatsApp Video - India Taj Mahal Heritage Drone Footage',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    folderName: 'WhatsApp Media',
    duration: 15,
    size: 4500000,
    format: 'MP4',
    resolution: '720p HD',
    addedAt: Date.now() - 1000 * 60 * 60 * 2,
    isFavorite: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-4',
    title: 'Camera Recording - Diwali Festival Fireworks Celebration',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    type: 'video',
    folderName: 'Camera',
    duration: 15,
    size: 8900000,
    format: 'MP4',
    resolution: '1080p 60fps',
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-5',
    title: 'Sintel Open Cinema Story',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'video',
    folderName: 'Movies',
    duration: 888,
    size: 195000000,
    format: 'MP4',
    resolution: '1080p',
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-6',
    title: 'Screen Record - Coding React App Tutorial',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    type: 'video',
    folderName: 'Screen Records',
    duration: 60,
    size: 14200000,
    format: 'WEBM',
    resolution: '1080p',
    addedAt: Date.now() - 1000 * 60 * 180,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
  },
  // Audio Samples
  {
    id: 'audio-1',
    title: 'Sitar & Tabla Classical Raga Fusion',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    folderName: 'Music & Podcasts',
    duration: 372,
    size: 6100000,
    format: 'MP3',
    artist: 'Pandit Ravi Sound',
    album: 'Indian Raga Chill 2026',
    addedAt: Date.now() - 1000 * 60 * 60 * 5,
    isFavorite: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'audio-2',
    title: 'Bollywood Lo-Fi Acoustic Sunset Mix',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    type: 'audio',
    folderName: 'Music & Podcasts',
    duration: 425,
    size: 7200000,
    format: 'MP3',
    artist: 'MB LoFi Beats',
    album: 'Midnight Chill Vol. 1',
    addedAt: Date.now() - 1000 * 60 * 60 * 20,
    isFavorite: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'audio-3',
    title: 'Bollywood Electro Beat - Workout Motivation',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    type: 'audio',
    folderName: 'Music & Podcasts',
    duration: 330,
    size: 5400000,
    format: 'MP3',
    artist: 'DJ MB Beats India',
    album: 'Desi EDM Bangers',
    addedAt: Date.now() - 1000 * 60 * 60 * 40,
    thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80'
  }
];
