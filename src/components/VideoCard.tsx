import React, { useState, useEffect } from 'react';
import { ExternalLink, Eye, Clock, Target, ThumbsUp, ThumbsDown, Database, CheckCircle, Play, Sparkles, Star } from 'lucide-react';
import { YouTubeVideo } from '../types/youtube';
import { formatViewCount, formatDuration, formatRelativeTime } from '../utils/youtube';
import { storeFeedback, checkExistingFeedback } from '../utils/seriesFinder';

interface VideoCardProps {
  video: YouTubeVideo;
  index: number;
  onFeedback?: (videoId: string, isRelevant: boolean) => void;
}

export function VideoCard({ video, index, onFeedback }: VideoCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'up' | 'down' | null>(null);
  const [isStoringNegative, setIsStoringNegative] = useState(false);
  const [alreadyInDatabase, setAlreadyInDatabase] = useState(false);
  const [isCheckingFeedback, setIsCheckingFeedback] = useState(true);
  
  // Check existing feedback when component mounts
  useEffect(() => {
    checkVideoFeedbackStatus();
  }, [video.id]);

  const checkVideoFeedbackStatus = async () => {
    try {
      const feedbackStatus = await checkExistingFeedback(video.id);
      
      setFeedbackGiven(feedbackStatus.hasFeedback);
      setFeedbackType(feedbackStatus.feedbackType);
      setAlreadyInDatabase(feedbackStatus.alreadyInDatabase);
      
      if (feedbackStatus.alreadyInDatabase) {
        console.log(`📊 Video ${video.id} already exists in database (previously thumbs down)`);
      }
    } catch (error) {
      console.error('Error checking feedback status:', error);
    } finally {
      setIsCheckingFeedback(false);
    }
  };
  
  const handleWatchVideo = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
  };

  // Enhanced feedback handling with duplicate prevention
  const handleFeedback = async (isRelevant: boolean) => {
    if (feedbackGiven || isStoringNegative) return;
    
    setFeedbackGiven(true);
    setFeedbackType(isRelevant ? 'up' : 'down');
    
    if (!isRelevant) {
      setIsStoringNegative(true);
      console.log('👎 THUMBS DOWN - processing feedback...');
    }
    
    try {
      // Store feedback (will check for duplicates automatically)
      await storeFeedback(video.id, isRelevant, video.title);
      
      // Notify parent component
      if (onFeedback) {
        onFeedback(video.id, isRelevant);
      }
      
      console.log(`📝 Feedback processed: Video "${video.title}" is ${isRelevant ? 'relevant' : 'not relevant'}`);
      
      // Re-check status to update UI properly
      await checkVideoFeedbackStatus();
      
    } catch (error) {
      console.error('Error processing feedback:', error);
      // Reset state on error
      setFeedbackGiven(false);
      setFeedbackType(null);
    } finally {
      setIsStoringNegative(false);
    }
  };

  const getSimilarityColor = (similarity?: number) => {
    if (!similarity) return 'bg-gray-600';
    if (similarity > 0.8) return 'bg-white';
    if (similarity > 0.6) return 'bg-gray-300';
    return 'bg-gray-500';
  };

  const getSimilarityText = (similarity?: number) => {
    if (!similarity) return 'Unknown';
    if (similarity > 0.8) return 'High Match';
    if (similarity > 0.6) return 'Good Match';
    return 'Possible Match';
  };

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return 'bg-white text-black';
    if (index === 1) return 'bg-gray-300 text-black';
    if (index === 2) return 'bg-gray-500 text-white';
    return 'bg-gray-700 text-white';
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10 hover:border-white/20">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="relative group/thumbnail">
            <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300"></div>
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-40 h-24 object-cover transition-transform duration-300 group-hover/thumbnail:scale-110"
              />
              
              {/* Enhanced overlay elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-medium border border-white/20">
                {formatDuration(video.duration)}
              </div>
              
              {/* Rank badge */}
              <div className={`absolute top-2 left-2 ${getRankBadgeColor(index)} text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1`}>
                {index === 0 && <Star className="w-3 h-3" />}
                #{index + 1}
              </div>
              
              {/* Similarity badge */}
              {video.similarity && (
                <div className={`absolute top-2 right-2 ${getSimilarityColor(video.similarity)} text-black text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg font-medium`}>
                  <Target className="w-3 h-3" />
                  {Math.round(video.similarity * 100)}%
                </div>
              )}
              
              {/* Database indicator */}
              {alreadyInDatabase && (
                <div className="absolute bottom-2 left-2 bg-gray-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <Database className="w-3 h-3" />
                  <span className="font-medium">In DB</span>
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg mb-3 line-clamp-2 group-hover:text-gray-200 transition-colors leading-tight">
            {video.title}
          </h3>
          
          <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{formatViewCount(video.viewCount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatRelativeTime(video.publishedAt)}</span>
            </div>
            {video.similarity && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className={`font-semibold ${
                  video.similarity > 0.8 ? 'text-white' : 
                  video.similarity > 0.6 ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {getSimilarityText(video.similarity)}
                </span>
              </div>
            )}
          </div>

          {/* Enhanced similarity display */}
          {video.similarity && (
            <div className="bg-white/10 rounded-xl p-3 mb-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="font-semibold text-white text-sm">AI Similarity Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-black/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${getSimilarityColor(video.similarity)} transition-all duration-1000`}
                    style={{ width: `${video.similarity * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-white">
                  {(video.similarity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Database status indicator */}
          {alreadyInDatabase && (
            <div className="bg-white/10 rounded-xl p-3 mb-4 border border-white/20">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-white" />
                <span className="font-semibold text-white text-sm">Training Data Status</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                This video is already stored in our training database (previously marked as not relevant)
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleWatchVideo}
              className="group/btn relative overflow-hidden bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-white/25 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative">Watch Now</span>
              <ExternalLink className="relative w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>

            {/* Enhanced feedback buttons */}
            {isCheckingFeedback ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Checking status...</span>
              </div>
            ) : !feedbackGiven ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleFeedback(true)}
                  className="group/thumb p-3 bg-white/20 hover:bg-white/40 text-white rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/25 border border-white/30"
                  title="This video is relevant (positive feedback)"
                >
                  <ThumbsUp className="w-4 h-4 group-hover/thumb:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={isStoringNegative || alreadyInDatabase}
                  className="group/thumb p-3 bg-white/20 hover:bg-white/40 text-white rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-white/30"
                  title={alreadyInDatabase ? "Already stored in database" : "This video is NOT relevant (will be stored as negative example)"}
                >
                  {isStoringNegative ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ThumbsDown className="w-4 h-4 group-hover/thumb:scale-110 transition-transform" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {feedbackType === 'up' && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 border border-white/30">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">Marked as relevant</span>
                  </div>
                )}
                {feedbackType === 'down' && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 border border-white/30">
                    <Database className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">
                      {alreadyInDatabase ? 'Already in database' : 'Added to training data'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}