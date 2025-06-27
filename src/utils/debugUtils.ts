// Enhanced debug utilities to understand embedding quality issues

import { supabase } from './supabaseClient'
import { getTextEmbedding, cosineSimilarity, analyzeEmbeddingQuality } from './embeddings'

export async function debugSimilarityMatching(inputTitle: string, inputDescription: string = '') {
  console.log('🔍 COMPREHENSIVE DEBUGGING ANALYSIS')
  console.log('===================================')
  
  // 1. Check database content and embedding quality
  const { data: allVideos, error } = await supabase
    .from('shorts_data')
    .select('video_id, title, description, embedding')
    .limit(100) // Limit for performance
  
  if (error) {
    console.error('❌ Database error:', error)
    return
  }
  
  console.log(`📊 Analyzing ${allVideos?.length || 0} videos from database`)
  
  if (!allVideos || allVideos.length === 0) {
    console.log('⚠️ DATABASE IS EMPTY - This is why you get no results!')
    return
  }
  
  // 2. Analyze embedding quality distribution
  const qualityAnalysis = allVideos.map(video => ({
    video_id: video.video_id,
    title: video.title.slice(0, 40),
    ...analyzeEmbeddingQuality(video.embedding)
  }))
  
  const qualityStats = {
    'sentence-transformer': qualityAnalysis.filter(q => q.type === 'sentence-transformer').length,
    'fallback-hash': qualityAnalysis.filter(q => q.type === 'fallback-hash').length,
    'invalid': qualityAnalysis.filter(q => q.type === 'invalid').length
  }
  
  console.log('\n📈 EMBEDDING QUALITY DISTRIBUTION:')
  console.log('==================================')
  console.log(`Sentence Transformer: ${qualityStats['sentence-transformer']} (${((qualityStats['sentence-transformer']/allVideos.length)*100).toFixed(1)}%)`)
  console.log(`Fallback Hash: ${qualityStats['fallback-hash']} (${((qualityStats['fallback-hash']/allVideos.length)*100).toFixed(1)}%)`)
  console.log(`Invalid: ${qualityStats['invalid']} (${((qualityStats['invalid']/allVideos.length)*100).toFixed(1)}%)`)
  
  // 3. Generate and analyze input embedding
  const inputText = `${inputTitle} ${inputDescription}`
  console.log(`\n🤖 ANALYZING INPUT: "${inputText.slice(0, 100)}..."`)
  console.log('================================================')
  
  const inputEmbedding = await getTextEmbedding(inputText)
  const inputQuality = analyzeEmbeddingQuality(inputEmbedding)
  
  console.log(`Input embedding quality: ${inputQuality.type}`)
  console.log(`Details: ${inputQuality.details}`)
  
  // 4. Calculate similarities with quality grouping
  console.log('\n🧮 SIMILARITY ANALYSIS BY EMBEDDING TYPE:')
  console.log('=========================================')
  
  const sentenceTransformerVideos = allVideos.filter(v => 
    analyzeEmbeddingQuality(v.embedding).type === 'sentence-transformer'
  )
  const fallbackVideos = allVideos.filter(v => 
    analyzeEmbeddingQuality(v.embedding).type === 'fallback-hash'
  )
  
  // Analyze sentence transformer matches
  if (sentenceTransformerVideos.length > 0) {
    console.log(`\n🎯 SENTENCE TRANSFORMER MATCHES (${sentenceTransformerVideos.length} videos):`)
    const stResults = sentenceTransformerVideos.map(video => ({
      ...video,
      score: cosineSimilarity(inputEmbedding, video.embedding)
    })).sort((a, b) => b.score - a.score)
    
    stResults.slice(0, 5).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title.slice(0, 50)} - ${(video.score * 100).toFixed(1)}%`)
    })
    
    const stThresholds = [0.1, 0.2, 0.3, 0.4, 0.5]
    console.log('Sentence Transformer threshold analysis:')
    stThresholds.forEach(threshold => {
      const count = stResults.filter(r => r.score > threshold).length
      console.log(`   Above ${(threshold * 100)}%: ${count} videos`)
    })
  }
  
  // Analyze fallback matches
  if (fallbackVideos.length > 0) {
    console.log(`\n🔄 FALLBACK HASH MATCHES (${fallbackVideos.length} videos):`)
    const fbResults = fallbackVideos.map(video => ({
      ...video,
      score: cosineSimilarity(inputEmbedding, video.embedding)
    })).sort((a, b) => b.score - a.score)
    
    fbResults.slice(0, 5).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title.slice(0, 50)} - ${(video.score * 100).toFixed(1)}%`)
    })
  }
  
  // 5. Recommendations
  console.log('\n💡 RECOMMENDATIONS:')
  console.log('===================')
  
  if (qualityStats['sentence-transformer'] === 0) {
    console.log('❌ NO SENTENCE TRANSFORMER EMBEDDINGS FOUND!')
    console.log('   → Your database only has fallback embeddings')
    console.log('   → Run fixDatabaseEmbeddings() to upgrade them')
  } else if (qualityStats['fallback-hash'] > qualityStats['sentence-transformer']) {
    console.log('⚠️ MIXED EMBEDDING QUALITY DETECTED!')
    console.log('   → Most embeddings are fallback quality')
    console.log('   → This causes poor similarity matching')
    console.log('   → Run fixDatabaseEmbeddings() to improve quality')
  } else {
    console.log('✅ Good embedding quality distribution')
    if (inputQuality.type === 'fallback-hash') {
      console.log('⚠️ But your input embedding is fallback quality')
      console.log('   → Check your Hugging Face API key')
    }
  }
  
  return {
    totalVideos: allVideos.length,
    qualityStats,
    inputQuality,
    recommendations: qualityStats['sentence-transformer'] === 0 ? 'fix-all' : 
                    qualityStats['fallback-hash'] > qualityStats['sentence-transformer'] ? 'fix-most' : 'good'
  }
}

// Quick fix for common issues
export async function quickFix() {
  console.log('🔧 RUNNING QUICK FIX...')
  
  const analysis = await debugSimilarityMatching('test', 'test')
  
  if (!analysis) return
  
  if (analysis.recommendations === 'fix-all' || analysis.recommendations === 'fix-most') {
    console.log('🔄 Fixing database embeddings...')
    const { fixDatabaseEmbeddings } = await import('./embeddings')
    await fixDatabaseEmbeddings(20) // Fix first 20 videos
    console.log('✅ Quick fix complete - try your search again!')
  } else {
    console.log('✅ No major issues detected')
  }
}

// Check specific video similarity
export async function testVideoSimilarity(videoId1: string, videoId2: string) {
  const { data, error } = await supabase
    .from('shorts_data')
    .select('video_id, title, embedding')
    .in('video_id', [videoId1, videoId2])
  
  if (error || !data || data.length !== 2) {
    console.error('❌ Could not fetch both videos')
    return
  }
  
  const [video1, video2] = data
  const similarity = cosineSimilarity(video1.embedding, video2.embedding)
  
  console.log(`🔍 Similarity between:`)
  console.log(`   "${video1.title.slice(0, 40)}"`)
  console.log(`   "${video2.title.slice(0, 40)}"`)
  console.log(`   Score: ${(similarity * 100).toFixed(1)}%`)
  
  return similarity
}

export async function quickDatabaseCheck() {
  const { data, error } = await supabase
    .from('shorts_data')
    .select('video_id, title, embedding')
    .limit(10)
  
  if (error) {
    console.error('❌ Database error:', error)
    return
  }
  
  console.log('🏥 QUICK DATABASE HEALTH CHECK:')
  console.log('===============================')
  console.log(`Sample size: ${data?.length || 0} videos`)
  
  if (data && data.length > 0) {
    data.forEach((video, index) => {
      const quality = analyzeEmbeddingQuality(video.embedding)
      console.log(`${index + 1}. ${video.title.slice(0, 35)} - ${quality.type}`)
    })
  }
}