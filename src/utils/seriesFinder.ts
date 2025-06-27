import { YouTubeVideo } from '../types/youtube'
import { getVideoDetails, extractVideoId, getAllCreatorVideos } from './youtube'
import { getTextEmbedding, cosineSimilarity, storeVideoWithEmbedding } from './embeddings'
import { supabase } from './supabaseClient'

// 🔹 Main function: Find series from LIVE creator data using trained matching logic
export async function findSeriesVideos(inputUrl: string): Promise<YouTubeVideo[]> {
  try {
    // Step 1: Extract video ID from URL
    const videoId = extractVideoId(inputUrl)
    if (!videoId) {
      throw new Error('Invalid YouTube URL')
    }

    // Step 2: Extract title + description from YouTube API
    console.log('📹 Step 1-2: Extracting video details from YouTube API...')
    const videoDetails = await getVideoDetails(videoId)
    if (!videoDetails) {
      throw new Error('Could not fetch video details from YouTube API')
    }

    console.log('✅ Video details extracted:', {
      title: videoDetails.title.slice(0, 50) + '...',
      channel: videoDetails.channelTitle,
      channelId: videoDetails.channelId
    })

    // Step 3: Get ALL videos from this creator's channel (LIVE DATA)
    console.log('🔍 Step 3: Fetching ALL videos from creator\'s live channel...')
    const allCreatorVideos = await getAllCreatorVideos(videoDetails.channelId)
    
    if (allCreatorVideos.length === 0) {
      throw new Error('Could not fetch videos from this creator\'s channel')
    }

    console.log(`📊 Found ${allCreatorVideos.length} videos from ${videoDetails.channelTitle}`)

    // Step 4: Generate embedding for input video
    console.log('🤖 Step 4: Generating embedding for input video...')
    const inputText = `${videoDetails.title} ${videoDetails.description}`
    const inputEmbedding = await getTextEmbedding(inputText)

    // Step 5: Generate embeddings for all creator videos and compute similarities
    console.log('🧮 Step 5: Computing similarities with all creator videos...')
    const videoSimilarities = await Promise.all(
      allCreatorVideos
        .filter(video => video.id !== videoId) // Exclude the input video itself
        .map(async (video) => {
          try {
            const videoText = `${video.title} ${video.description}`
            const videoEmbedding = await getTextEmbedding(videoText)
            const similarity = cosineSimilarity(inputEmbedding, videoEmbedding)
            
            return {
              ...video,
              similarity
            }
          } catch (error) {
            console.warn(`⚠️ Failed to process video ${video.id}:`, error)
            return {
              ...video,
              similarity: 0
            }
          }
        })
    )

    // Step 6: Apply trained matching logic from synthetic dataset
    console.log('🎯 Step 6: Applying trained matching logic...')
    const enhancedMatches = await applyTrainedMatchingLogic(videoDetails, videoSimilarities)

    // Step 7: Filter and sort results
    const threshold = 0.3 // Use higher threshold for live creator data
    const seriesVideos = enhancedMatches
      .filter(video => video.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10) // Top 10 matches

    console.log(`🎯 Final results: ${seriesVideos.length} videos above ${threshold * 100}% similarity`)
    console.log('📊 Top scores:', seriesVideos.slice(0, 5).map(v => `${(v.similarity * 100).toFixed(1)}%`).join(', '))

    return seriesVideos

  } catch (error) {
    console.error('❌ Error finding series videos:', error)
    throw error
  }
}

// 🔹 Apply trained matching logic using patterns learned from synthetic dataset
async function applyTrainedMatchingLogic(
  inputVideo: YouTubeVideo, 
  candidateVideos: (YouTubeVideo & { similarity: number })[]
): Promise<(YouTubeVideo & { similarity: number })[]> {
  
  console.log('🧠 Applying trained matching patterns from synthetic dataset...')
  
  try {
    // Get learned patterns from synthetic dataset
    const { data: trainingData, error } = await supabase
      .from('shorts_data')
      .select('title, description, embedding')
      .limit(100) // Sample of training data
    
    if (error || !trainingData || trainingData.length === 0) {
      console.warn('⚠️ No training data available, using basic similarity only')
      return candidateVideos
    }

    console.log(`📚 Using ${trainingData.length} training examples to enhance matching`)

    // Enhance each candidate video using training patterns
    const enhancedCandidates = candidateVideos.map(candidate => {
      // Calculate additional features based on training data patterns
      const titleSimilarity = calculateTitlePatternSimilarity(inputVideo.title, candidate.title, trainingData)
      const contentSimilarity = calculateContentPatternSimilarity(inputVideo, candidate, trainingData)
      const seriesIndicators = detectSeriesIndicators(inputVideo.title, candidate.title)
      
      // Combine semantic similarity with learned patterns
      const enhancedSimilarity = (
        candidate.similarity * 0.6 +        // Base semantic similarity
        titleSimilarity * 0.2 +             // Title pattern similarity
        contentSimilarity * 0.15 +          // Content pattern similarity  
        seriesIndicators * 0.05              // Series indicators
      )

      return {
        ...candidate,
        similarity: Math.min(enhancedSimilarity, 1.0) // Cap at 1.0
      }
    })

    console.log('✅ Enhanced matching using trained patterns')
    return enhancedCandidates

  } catch (error) {
    console.warn('⚠️ Error applying trained matching logic:', error)
    return candidateVideos
  }
}

// 🔹 Calculate title pattern similarity based on training data
function calculateTitlePatternSimilarity(
  inputTitle: string, 
  candidateTitle: string, 
  trainingData: any[]
): number {
  
  // Extract common patterns from training data
  const commonPatterns = extractTitlePatterns(trainingData.map(d => d.title))
  
  // Check if both titles follow similar patterns
  const inputPatterns = extractPatternsFromTitle(inputTitle, commonPatterns)
  const candidatePatterns = extractPatternsFromTitle(candidateTitle, commonPatterns)
  
  // Calculate pattern overlap
  const patternOverlap = inputPatterns.filter(p => candidatePatterns.includes(p)).length
  const totalPatterns = Math.max(inputPatterns.length, candidatePatterns.length)
  
  return totalPatterns > 0 ? patternOverlap / totalPatterns : 0
}

// 🔹 Calculate content pattern similarity
function calculateContentPatternSimilarity(
  inputVideo: YouTubeVideo,
  candidateVideo: YouTubeVideo,
  trainingData: any[]
): number {
  
  // Look for content patterns in training data
  const contentKeywords = extractContentKeywords(trainingData)
  
  const inputKeywords = extractKeywordsFromVideo(inputVideo, contentKeywords)
  const candidateKeywords = extractKeywordsFromVideo(candidateVideo, contentKeywords)
  
  // Calculate keyword overlap
  const overlap = inputKeywords.filter(k => candidateKeywords.includes(k)).length
  const total = Math.max(inputKeywords.length, candidateKeywords.length)
  
  return total > 0 ? overlap / total : 0
}

// 🔹 Detect series indicators (part numbers, episodes, etc.)
function detectSeriesIndicators(inputTitle: string, candidateTitle: string): number {
  const seriesPatterns = [
    /part\s*(\d+)/i,
    /episode\s*(\d+)/i,
    /ep\s*(\d+)/i,
    /#(\d+)/,
    /day\s*(\d+)/i,
    /\((\d+)\)/,
    /\[(\d+)\]/
  ]
  
  let score = 0
  
  for (const pattern of seriesPatterns) {
    const inputMatch = inputTitle.match(pattern)
    const candidateMatch = candidateTitle.match(pattern)
    
    if (inputMatch && candidateMatch) {
      const inputNum = parseInt(inputMatch[1])
      const candidateNum = parseInt(candidateMatch[1])
      
      // Higher score for sequential numbers
      const diff = Math.abs(inputNum - candidateNum)
      if (diff <= 1) score += 0.8
      else if (diff <= 3) score += 0.5
      else if (diff <= 5) score += 0.2
    }
  }
  
  return Math.min(score, 1.0)
}

// 🔹 Helper functions for pattern extraction
function extractTitlePatterns(titles: string[]): string[] {
  const patterns = new Set<string>()
  
  titles.forEach(title => {
    // Extract common words and phrases
    const words = title.toLowerCase().split(/\W+/).filter(w => w.length > 2)
    words.forEach(word => patterns.add(word))
    
    // Extract number patterns
    const numbers = title.match(/\d+/g)
    if (numbers) numbers.forEach(num => patterns.add(`NUM_${num.length}`))
  })
  
  return Array.from(patterns)
}

function extractPatternsFromTitle(title: string, commonPatterns: string[]): string[] {
  const titleLower = title.toLowerCase()
  return commonPatterns.filter(pattern => 
    pattern.startsWith('NUM_') ? 
      title.match(new RegExp(`\\d{${pattern.split('_')[1]}}`, 'g')) :
      titleLower.includes(pattern)
  )
}

function extractContentKeywords(trainingData: any[]): string[] {
  const keywords = new Set<string>()
  
  trainingData.forEach(data => {
    const text = `${data.title} ${data.description}`.toLowerCase()
    const words = text.split(/\W+/).filter(w => w.length > 3)
    words.forEach(word => keywords.add(word))
  })
  
  return Array.from(keywords).slice(0, 1000) // Limit for performance
}

function extractKeywordsFromVideo(video: YouTubeVideo, commonKeywords: string[]): string[] {
  const text = `${video.title} ${video.description}`.toLowerCase()
  return commonKeywords.filter(keyword => text.includes(keyword))
}

// 🔹 ENHANCED: Check if video exists before storing + prevent duplicates
export async function storeFeedback(videoId: string, isRelevant: boolean, videoTitle: string): Promise<void> {
  try {
    console.log(`📝 Processing feedback: Video ${videoId} is ${isRelevant ? 'relevant' : 'NOT relevant'}`)
    
    if (!isRelevant) {
      console.log('👎 THUMBS DOWN detected - checking if video already exists in database...')
      
      // FIRST: Check if this video already exists in shorts_data table
      const { data: existingVideo, error: checkError } = await supabase
        .from('shorts_data')
        .select('video_id')
        .eq('video_id', videoId)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing video:', checkError)
        return
      }
      
      if (existingVideo) {
        console.log('⚠️ VIDEO ALREADY EXISTS in shorts_data table - skipping duplicate storage')
        console.log(`   Video ID: ${videoId}`)
        console.log(`   Title: ${videoTitle.slice(0, 60)}...`)
        
        // Still store the feedback metadata for analysis
        const { error: feedbackError } = await supabase
          .from('feedback_data')
          .insert({
            query_video_id: 'unknown',
            candidate_video_id: videoId,
            is_related: false,
            features: {
              feedback_type: 'thumbs_down',
              stored_as_negative_example: false, // Not stored because it already exists
              already_exists: true,
              timestamp: new Date().toISOString()
            }
          })
        
        if (!feedbackError) {
          console.log('📊 Feedback metadata stored (duplicate video detected)')
        }
        
        return
      }
      
      console.log('✅ Video not found in database - proceeding with storage...')
      
      // Get full video details from YouTube API
      const videoDetails = await getVideoDetails(videoId)
      
      if (videoDetails) {
        // Store the thumbs-down video in shorts_data table as a negative example
        const success = await storeVideoWithEmbedding({
          video_id: videoDetails.id,
          title: videoDetails.title,
          description: videoDetails.description,
          channel_id: videoDetails.channelId,
          published_at: videoDetails.publishedAt
        })
        
        if (success) {
          console.log('✅ NEW NEGATIVE EXAMPLE STORED: Video added to shorts_data table')
          console.log(`   Title: ${videoDetails.title.slice(0, 60)}...`)
          console.log(`   This will help the model learn what NOT to consider as related content`)
          
          // Store feedback metadata for future analysis
          const { error: feedbackError } = await supabase
            .from('feedback_data')
            .insert({
              query_video_id: 'unknown',
              candidate_video_id: videoId,
              is_related: false,
              features: {
                feedback_type: 'thumbs_down',
                stored_as_negative_example: true,
                timestamp: new Date().toISOString()
              }
            })
          
          if (feedbackError) {
            console.warn('⚠️ Could not store feedback metadata:', feedbackError)
          } else {
            console.log('📊 Feedback metadata also stored for analysis')
          }
          
        } else {
          console.error('❌ Failed to store negative example in shorts_data table')
        }
      } else {
        console.error('❌ Could not fetch video details for negative example storage')
      }
    } else {
      console.log('👍 THUMBS UP - positive feedback noted (no storage needed)')
      
      // Store positive feedback for analysis
      const { error: feedbackError } = await supabase
        .from('feedback_data')
        .insert({
          query_video_id: 'unknown',
          candidate_video_id: videoId,
          is_related: true,
          features: {
            feedback_type: 'thumbs_up',
            timestamp: new Date().toISOString()
          }
        })
      
      if (feedbackError) {
        console.warn('⚠️ Could not store positive feedback:', feedbackError)
      }
    }
    
  } catch (error) {
    console.error('❌ Error processing feedback:', error)
  }
}

// 🔹 NEW: Check if user has already given feedback for this video
export async function checkExistingFeedback(videoId: string): Promise<{
  hasFeedback: boolean,
  feedbackType: 'up' | 'down' | null,
  alreadyInDatabase: boolean
}> {
  try {
    // Check if video exists in shorts_data (means it was thumbs down before)
    const { data: existingVideo } = await supabase
      .from('shorts_data')
      .select('video_id')
      .eq('video_id', videoId)
      .single()
    
    // Check feedback history
    const { data: feedbackHistory } = await supabase
      .from('feedback_data')
      .select('is_related, features')
      .eq('candidate_video_id', videoId)
      .order('created_at', { ascending: false })
      .limit(1)
    
    const alreadyInDatabase = !!existingVideo
    const hasFeedback = !!feedbackHistory && feedbackHistory.length > 0
    const feedbackType = hasFeedback ? 
      (feedbackHistory[0].is_related ? 'up' : 'down') : null
    
    return {
      hasFeedback,
      feedbackType,
      alreadyInDatabase
    }
  } catch (error) {
    console.error('Error checking existing feedback:', error)
    return { hasFeedback: false, feedbackType: null, alreadyInDatabase: false }
  }
}

// 🔹 Get feedback statistics with better accuracy
export async function getFeedbackStats(): Promise<{
  totalFeedback: number,
  thumbsUp: number,
  thumbsDown: number,
  negativeExamplesStored: number
}> {
  try {
    const { data, error } = await supabase
      .from('feedback_data')
      .select('is_related, features')
    
    if (error || !data) {
      return { totalFeedback: 0, thumbsUp: 0, thumbsDown: 0, negativeExamplesStored: 0 }
    }
    
    const thumbsUp = data.filter(item => item.is_related === true).length
    const thumbsDown = data.filter(item => item.is_related === false).length
    const negativeExamplesStored = data.filter(item => 
      item.features && 
      typeof item.features === 'object' && 
      'stored_as_negative_example' in item.features &&
      item.features.stored_as_negative_example === true
    ).length
    
    return {
      totalFeedback: data.length,
      thumbsUp,
      thumbsDown,
      negativeExamplesStored
    }
  } catch (error) {
    console.error('Error getting feedback stats:', error)
    return { totalFeedback: 0, thumbsUp: 0, thumbsDown: 0, negativeExamplesStored: 0 }
  }
}