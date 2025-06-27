import { supabase } from './supabaseClient'

// 🔹 Get text embedding using Hugging Face API (with better error handling)
export async function getTextEmbedding(input: string): Promise<number[]> {
  try {
    console.log('🤖 Generating embedding for:', input.slice(0, 100) + '...')
    
    // Clean input text
    const cleanInput = input.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!cleanInput) {
      console.warn('⚠️ Empty input, using fallback')
      return generateFallbackEmbedding(input)
    }
    
    const res = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: cleanInput,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.warn("⚠️ HF API failed:", res.status, errorText);
      return generateFallbackEmbedding(input);
    }

    const data = await res.json();

    // Handle different response formats
    if (Array.isArray(data) && Array.isArray(data[0]) && data[0].length === 384) {
      console.log('✅ Generated real sentence transformer embedding (384D)')
      return normalizeVector(data[0])
    }

    // Handle model loading response
    if (data.error && data.error.includes('loading')) {
      console.log('⏳ Model loading, waiting and retrying...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      return getTextEmbedding(input) // Retry once
    }

    console.warn("⚠️ Unexpected HF response format:", JSON.stringify(data).slice(0, 200));
    return generateFallbackEmbedding(input);

  } catch (err) {
    console.warn("⚠️ HF API error:", err);
    return generateFallbackEmbedding(input);
  }
}

// 🔹 Normalize vector to unit length (important for cosine similarity)
function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  return norm > 0 ? vector.map(val => val / norm) : vector
}

// 🔹 Improved fallback embedding (more consistent)
function generateFallbackEmbedding(text: string): number[] {
  console.log('🔄 Using improved fallback embedding generation')
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  const embedding = new Array(384).fill(0)

  // Use multiple hash functions for better distribution
  words.forEach((word, wordIndex) => {
    for (let i = 0; i < 3; i++) {
      const hash = simpleHash(word + i.toString())
      const index = hash % 384
      embedding[index] += 1 / (wordIndex + 1) // Weight by position
    }
  })

  // Normalize the fallback embedding too
  return normalizeVector(embedding)
}

// 🔹 Better hash function
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// 🔹 Enhanced cosine similarity with validation
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.warn('⚠️ Invalid vectors for similarity calculation')
    return 0
  }
  
  if (vecA.length !== vecB.length) {
    console.warn(`⚠️ Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`)
    return 0
  }

  if (vecA.length !== 384) {
    console.warn(`⚠️ Unexpected vector dimension: ${vecA.length}`)
    return 0
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  
  if (denominator === 0) {
    console.warn('⚠️ Zero vector detected in similarity calculation')
    return 0
  }
  
  const similarity = dotProduct / denominator
  return Math.max(-1, Math.min(1, similarity)) // Clamp to [-1, 1]
}

// 🔹 Analyze embedding quality
export function analyzeEmbeddingQuality(embedding: number[]): {
  type: 'sentence-transformer' | 'fallback-hash' | 'invalid',
  confidence: number,
  details: string
} {
  if (!Array.isArray(embedding) || embedding.length !== 384) {
    return { type: 'invalid', confidence: 0, details: 'Wrong dimension or not array' }
  }
  
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  const nonZeroCount = embedding.filter(val => Math.abs(val) > 0.001).length
  const maxValue = Math.max(...embedding.map(Math.abs))
  
  // Sentence transformer characteristics
  const isNormalized = Math.abs(norm - 1.0) < 0.1
  const isDense = nonZeroCount > 200 // Most values should be non-zero
  const isReasonableRange = maxValue < 1.0 // Values shouldn't be too large
  
  if (isNormalized && isDense && isReasonableRange) {
    return { 
      type: 'sentence-transformer', 
      confidence: 0.9, 
      details: `Normalized (${norm.toFixed(3)}), dense (${nonZeroCount}/384 non-zero)` 
    }
  }
  
  if (nonZeroCount < 50) {
    return { 
      type: 'fallback-hash', 
      confidence: 0.8, 
      details: `Sparse (${nonZeroCount}/384 non-zero), norm: ${norm.toFixed(3)}` 
    }
  }
  
  return { 
    type: 'fallback-hash', 
    confidence: 0.6, 
    details: `Uncertain quality, norm: ${norm.toFixed(3)}, non-zero: ${nonZeroCount}` 
  }
}

// 🔹 MAIN WORKFLOW with embedding quality analysis
export async function fetchAndMatch(title: string, description?: string): Promise<any[]> {
  try {
    console.log('📊 Step 4: Fetching all embedding vectors from Supabase...')
    
    const { data, error } = await supabase
      .from('shorts_data')
      .select('video_id, title, description, embedding, channel_id, published_at')

    if (error) {
      console.error('❌ Error fetching from Supabase:', error)
      return []
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No data found in shorts_data table')
      return []
    }

    console.log(`📈 Found ${data.length} videos in database`)

    // Analyze database embedding quality
    const embeddingAnalysis = data.slice(0, 10).map(item => ({
      title: item.title.slice(0, 30),
      ...analyzeEmbeddingQuality(item.embedding)
    }))
    
    console.log('🔍 Database embedding quality sample:')
    embeddingAnalysis.forEach(analysis => {
      console.log(`   ${analysis.title}: ${analysis.type} (${analysis.details})`)
    })

    // Step 3: Generate input embedding
    const input = `${title} ${description ?? ""}`
    console.log('🔍 Step 3: Generating embedding for combined input...')
    const inputEmbedding = await getTextEmbedding(input)
    
    const inputAnalysis = analyzeEmbeddingQuality(inputEmbedding)
    console.log(`🤖 Input embedding quality: ${inputAnalysis.type} (${inputAnalysis.details})`)

    // Step 5: Compute cosine similarity with quality filtering
    console.log('🧮 Step 5: Computing cosine similarity with quality filtering...')
    
    const matches = data
      .map(item => {
        const storedEmbedding = item.embedding
        const storedAnalysis = analyzeEmbeddingQuality(storedEmbedding)
        
        // Only compute similarity for valid embeddings
        if (storedAnalysis.type === 'invalid') {
          return { ...item, score: 0, embeddingQuality: storedAnalysis.type }
        }
        
        const score = cosineSimilarity(inputEmbedding, storedEmbedding)
        return { ...item, score, embeddingQuality: storedAnalysis.type }
      })
      .filter(item => item.embeddingQuality !== 'invalid') // Remove invalid embeddings

    // Separate by embedding type for better analysis
    const sentenceTransformerMatches = matches.filter(m => m.embeddingQuality === 'sentence-transformer')
    const fallbackMatches = matches.filter(m => m.embeddingQuality === 'fallback-hash')
    
    console.log(`📊 Embedding types in database:`)
    console.log(`   Sentence Transformer: ${sentenceTransformerMatches.length}`)
    console.log(`   Fallback Hash: ${fallbackMatches.length}`)

    // Sort all matches by score
    matches.sort((a, b) => b.score - a.score)
    
    // Show top scores by type
    if (sentenceTransformerMatches.length > 0) {
      const topST = sentenceTransformerMatches.slice(0, 3)
      console.log('🎯 Top Sentence Transformer matches:', 
        topST.map(m => `${m.score.toFixed(3)}`).join(', '))
    }
    
    if (fallbackMatches.length > 0) {
      const topFB = fallbackMatches.slice(0, 3)
      console.log('🎯 Top Fallback matches:', 
        topFB.map(m => `${m.score.toFixed(3)}`).join(', '))
    }

    // Use adaptive threshold based on embedding quality
    let threshold = 0.1
    if (inputAnalysis.type === 'sentence-transformer' && sentenceTransformerMatches.length > 0) {
      threshold = 0.3 // Higher threshold for real embeddings
      console.log('✅ Using high-quality threshold (30%) for sentence transformer embeddings')
    } else {
      console.log('⚠️ Using low threshold (10%) due to mixed embedding quality')
    }

    const topMatches = matches
      .filter(match => match.score > threshold)
      .slice(0, 10)

    console.log(`🎯 Final results: ${topMatches.length} matches above ${(threshold * 100)}% threshold`)
    
    return topMatches
  } catch (err) {
    console.error('❌ Error in fetchAndMatch:', err)
    return []
  }
}

// 🔹 Store video with quality-checked embedding
export async function storeVideoWithEmbedding(videoData: {
  video_id: string
  title: string
  description: string
  channel_id: string
  published_at: string
}): Promise<boolean> {
  try {
    console.log('💾 Storing video with embedding:', videoData.title.slice(0, 50) + '...')
    
    const input = `${videoData.title} ${videoData.description ?? ""}`
    const embedding = await getTextEmbedding(input)
    
    // Verify embedding quality before storing
    const quality = analyzeEmbeddingQuality(embedding)
    console.log(`🔍 Embedding quality: ${quality.type} (${quality.details})`)

    const { error } = await supabase
      .from('shorts_data')
      .upsert({
        video_id: videoData.video_id,
        title: videoData.title,
        description: videoData.description,
        channel_id: videoData.channel_id,
        published_at: videoData.published_at,
        embedding: embedding,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'video_id'
      })

    if (error) {
      console.error('❌ Error inserting video into Supabase:', error)
      return false
    }

    console.log(`✅ Successfully stored video with ${quality.type} embedding`)
    return true
  } catch (err) {
    console.error('❌ Error in storeVideoWithEmbedding:', err)
    return false
  }
}

// 🔹 Batch re-process existing videos to fix embedding quality
export async function fixDatabaseEmbeddings(limit: number = 50): Promise<void> {
  console.log(`🔧 Fixing database embeddings (processing ${limit} videos)...`)
  
  const { data, error } = await supabase
    .from('shorts_data')
    .select('video_id, title, description, embedding')
    .limit(limit)

  if (error || !data) {
    console.error('❌ Error fetching videos for fixing:', error)
    return
  }

  let fixed = 0
  for (const video of data) {
    const quality = analyzeEmbeddingQuality(video.embedding)
    
    if (quality.type === 'fallback-hash' || quality.type === 'invalid') {
      console.log(`🔧 Fixing embedding for: ${video.title.slice(0, 40)}...`)
      
      const input = `${video.title} ${video.description ?? ""}`
      const newEmbedding = await getTextEmbedding(input)
      
      const { error: updateError } = await supabase
        .from('shorts_data')
        .update({ embedding: newEmbedding })
        .eq('video_id', video.video_id)
      
      if (!updateError) {
        fixed++
        console.log(`✅ Fixed embedding for video ${video.video_id}`)
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  console.log(`🎉 Fixed ${fixed} embeddings out of ${data.length} processed`)
}