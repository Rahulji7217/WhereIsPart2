import { YouTubeVideo, YouTubeSearchResponse, YouTubeVideoResponse } from '../types/youtube';

const API_KEY = 'AIzaSyB1BMDjqew4Y9XgRcGNN2XLtN-BxJ7AsiA';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }
    
    const data: YouTubeVideoResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    const video = data.items[0];
    
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.medium.url,
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      viewCount: video.statistics.viewCount,
      duration: video.contentDetails.duration,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

// 🔹 NEW: Fetch ALL videos from a creator's channel (LIVE DATA SOURCE)
export async function getAllCreatorVideos(channelId: string): Promise<YouTubeVideo[]> {
  const allVideos: YouTubeVideo[] = [];
  let nextPageToken = '';
  let totalFetched = 0;
  const maxVideos = 100; // Reasonable limit for live analysis

  try {
    console.log(`🔍 Fetching ALL videos from creator's channel (live data)...`);
    
    do {
      const searchUrl = `${BASE_URL}/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&order=date${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${API_KEY}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        console.warn('⚠️ YouTube API error:', response.status);
        break;
      }
      
      const data: YouTubeSearchResponse = await response.json();
      if (!data.items || data.items.length === 0) break;

      // Get detailed information for this batch
      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const detailsResponse = await fetch(
        `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`
      );
      
      if (!detailsResponse.ok) break;
      
      const detailsData: YouTubeVideoResponse = await detailsResponse.json();
      
      const batchVideos: YouTubeVideo[] = detailsData.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium.url,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        viewCount: video.statistics.viewCount,
        duration: video.contentDetails.duration,
      }));

      allVideos.push(...batchVideos);
      totalFetched += batchVideos.length;
      
      console.log(`📊 Fetched ${totalFetched} live videos so far...`);
      
      nextPageToken = data.nextPageToken || '';
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } while (nextPageToken && totalFetched < maxVideos);

    console.log(`✅ Fetched ${allVideos.length} total live videos from creator`);
    return allVideos;
    
  } catch (error) {
    console.error('Error fetching creator videos:', error);
    return allVideos;
  }
}

export function formatViewCount(count: string): string {
  const num = parseInt(count);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return count;
}

export function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return hours === 0 ? 'Just now' : `${hours}h ago`;
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else if (diffInHours < 24 * 30) {
    const weeks = Math.floor(diffInHours / (24 * 7));
    return `${weeks}w ago`;
  } else {
    const months = Math.floor(diffInHours / (24 * 30));
    return `${months}mo ago`;
  }
}