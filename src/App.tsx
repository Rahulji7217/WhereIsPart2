import React, { useState, useEffect } from 'react';
import { Search, Youtube, AlertCircle, CheckCircle2, Brain, Database, Zap, Target, TrendingUp, Play, Sparkles, Star, ArrowDown, ChevronDown, Clock, Shield, Infinity, Heart, Rocket, Award } from 'lucide-react';
import { YouTubeVideo } from './types/youtube';
import { findSeriesVideos, getFeedbackStats } from './utils/seriesFinder';
import { VideoCard } from './components/VideoCard';
import SplashCursor from './components/SplashCursor';
import DecryptedText from './components/DecryptedText';
import Aurora from './components/Aurora';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seriesVideos, setSeriesVideos] = useState<YouTubeVideo[]>([]);
  const [originalVideo, setOriginalVideo] = useState<YouTubeVideo | null>(null);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbackStats, setFeedbackStats] = useState({
    totalFeedback: 0,
    thumbsUp: 0,
    thumbsDown: 0,
    negativeExamplesStored: 0
  });

  // Load feedback stats on component mount
  useEffect(() => {
    loadFeedbackStats();
  }, []);

  const loadFeedbackStats = async () => {
    try {
      const stats = await getFeedbackStats();
      setFeedbackStats(stats);
    } catch (error) {
      console.error('Error loading feedback stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setSeriesVideos([]);
    setOriginalVideo(null);

    try {
      console.log('🚀 Starting LIVE creator analysis for URL:', url);
      
      // Find series from LIVE creator data using trained matching logic
      const series = await findSeriesVideos(url);
      
      if (series.length === 0) {
        setError('No similar videos found in this creator\'s channel. This might be a standalone video or the creator has limited content.');
        return;
      }

      console.log('✅ Live creator analysis complete, displaying results');
      setSeriesVideos(series);
      
      // Extract original video info from the first result's channel info
      if (series.length > 0) {
        setOriginalVideo({
          id: url.split('/').pop()?.split('?')[0] || '',
          title: 'Original Video',
          description: '',
          thumbnail: '',
          publishedAt: '',
          channelTitle: series[0].channelTitle,
          channelId: series[0].channelId,
          viewCount: '0',
          duration: ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the creator\'s content. Please try again.');
      console.error('❌ Live creator analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (videoId: string, isRelevant: boolean) => {
    setFeedbackCount(prev => prev + 1);
    console.log(`📊 Total feedback received: ${feedbackCount + 1} (helps improve matching logic)`);
    
    // Reload feedback stats to show updated numbers
    await loadFeedbackStats();
  };

  const clearResults = () => {
    setSeriesVideos([]);
    setOriginalVideo(null);
    setError('');
    setUrl('');
    setFeedbackCount(0);
  };

  const scrollToSearch = () => {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-sans">
      {/* Aurora Background Animation */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.3}
          amplitude={0.8}
          speed={0.3}
        />
      </div>

      {/* Monochrome Interactive Fluid Background */}
      <SplashCursor 
        DENSITY_DISSIPATION={2.5}
        VELOCITY_DISSIPATION={1.5}
        SPLAT_RADIUS={0.15}
        SPLAT_FORCE={4000}
        COLOR_UPDATE_SPEED={8}
      />

      {/* Minimalist animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="text-center max-w-7xl mx-auto">
            {/* Main Hero Content */}
            <div className="mb-12 sm:mb-16">
              {/* Product Name with Enhanced Visual Impact */}
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-2xl">
                    <Play className="w-8 h-8 sm:w-12 sm:h-12 text-black" />
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-2 sm:mb-4 leading-[0.9] tracking-tight">
                    <DecryptedText 
                      text="WhereIsPart2"
                      animateOn="view"
                      speed={80}
                      maxIterations={15}
                      sequential={true}
                      revealDirection="center"
                      className="text-white"
                      encryptedClassName="text-gray-500 opacity-70"
                    />
                  </h1>
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-400 mb-4 sm:mb-6">
                    <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
                    <span className="text-sm sm:text-lg font-medium tracking-wider uppercase">
                      <DecryptedText 
                        text="AI-Powered Series Discovery"
                        animateOn="view"
                        speed={60}
                        maxIterations={12}
                        className="text-gray-400"
                        encryptedClassName="text-gray-600 opacity-60"
                      />
                    </span>
                    <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-3">
                  <Star className="w-6 h-6 sm:w-10 sm:h-10 text-white animate-pulse" />
                  <Target className="w-6 h-6 sm:w-10 sm:h-10 text-gray-300 animate-bounce" />
                </div>
              </div>

              {/* Compelling Tagline with Decrypted Animation */}
              <div className="mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-snug tracking-tight break-words mb-4 sm:mb-6">
                  <DecryptedText 
                    text="Turn Scrolling Into a Story."
                    animateOn="view"
                    speed={100}
                    maxIterations={20}
                    sequential={true}
                    revealDirection="start"
                    className="text-white"
                    encryptedClassName="text-gray-600 opacity-50"
                  />
                </h2>
              </div>

              {/* Call-to-Action */}
              <div className="flex flex-col items-center gap-6 sm:gap-8">
                <button
                  onClick={scrollToSearch}
                  className="group relative overflow-hidden bg-white text-black px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 flex items-center gap-3 sm:gap-4 shadow-2xl hover:shadow-white/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative">
                    <DecryptedText 
                      text="Start Finding Stories"
                      animateOn="hover"
                      speed={50}
                      maxIterations={6}
                      className="text-black"
                      encryptedClassName="text-gray-600 opacity-80"
                    />
                  </span>
                  <ArrowDown className="relative w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-y-1 transition-transform" />
                </button>

                {/* Scroll Indicator */}
                <div className="flex flex-col items-center gap-2 animate-bounce">
                  <span className="text-gray-500 text-sm font-medium">Look Down Bitch</span>
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100" />
                </div>
              </div>
            </div>

            {/* Hero Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    <DecryptedText 
                      text="Live Analysis"
                      animateOn="hover"
                      speed={80}
                      maxIterations={8}
                      className="text-white"
                      encryptedClassName="text-gray-400 opacity-70"
                    />
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Real-time creator data fetched directly from YouTube for the most accurate results.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    <DecryptedText 
                      text="AI Matching"
                      animateOn="hover"
                      speed={80}
                      maxIterations={8}
                      className="text-white"
                      encryptedClassName="text-gray-400 opacity-70"
                    />
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Advanced semantic analysis trained on 772+ videos to find perfect series matches.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    <DecryptedText 
                      text="Smart Learning"
                      animateOn="hover"
                      speed={80}
                      maxIterations={8}
                      className="text-white"
                      encryptedClassName="text-gray-400 opacity-70"
                    />
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Continuous improvement through user feedback and negative example storage.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 bg-white rounded-xl shadow-2xl">
                  <Award className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                  <DecryptedText 
                    text="Why Choose WhereIsPart2?"
                    animateOn="view"
                    speed={70}
                    maxIterations={15}
                    sequential={true}
                    className="text-white"
                    encryptedClassName="text-gray-500 opacity-60"
                  />
                </h2>
              </div>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                <DecryptedText 
                  text="Stop the endless scrolling and frustration. Get the complete story, every time."
                  animateOn="view"
                  speed={60}
                  maxIterations={12}
                  className="text-gray-400"
                  encryptedClassName="text-gray-600 opacity-50"
                />
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {/* Benefit 1: Never Miss a Part 2 */}
              <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Infinity className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      <DecryptedText 
                        text="Never Miss a Part 2"
                        animateOn="hover"
                        speed={60}
                        maxIterations={10}
                        className="text-white"
                        encryptedClassName="text-gray-400 opacity-70"
                      />
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-4">
                  Because 'To be continued…' shouldn't be a threat.
"No more hunting Part 2 like it's buried treasure.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete series discovery</span>
                  </div>
                </div>
              </div>

              {/* Benefit 2: Always Up-to-Date Results */}
              <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      <DecryptedText 
                        text="Always Up-to-Date"
                        animateOn="hover"
                        speed={60}
                        maxIterations={10}
                        className="text-white"
                        encryptedClassName="text-gray-400 opacity-70"
                      />
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    We stalk your favorite channels so you don't have to."
"Like your nosy neighbor, but for Shorts updates.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Live YouTube data</span>
                  </div>
                </div>
              </div>

              {/* Benefit 3: Save Hours of Searching */}
              <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Rocket className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      <DecryptedText 
                        text="Save Hours of Searching"
                        animateOn="hover"
                        speed={60}
                        maxIterations={10}
                        className="text-white"
                        encryptedClassName="text-gray-400 opacity-70"
                      />
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Scroll less, binge more.
Your thumb deserves a break.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Instant AI analysis</span>
                  </div>
                </div>
              </div>

              {/* Benefit 4: End the Cliffhanger Frustration */}
              <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      <DecryptedText 
                        text="End Cliffhanger Frustration"
                        animateOn="hover"
                        speed={60}
                        maxIterations={10}
                        className="text-white"
                        encryptedClassName="text-gray-400 opacity-70"
                      />
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    We don't do cliffhangers. We do closures.
No more yelling 'WHERE'S PART 4?!' at your screen.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete story resolution</span>
                  </div>
                </div>
              </div>

              {/* Benefit 5: Smart & Accurate Matching */}
              <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      <DecryptedText 
                        text="Smart & Accurate"
                        animateOn="hover"
                        speed={60}
                        maxIterations={10}
                        className="text-white"
                        encryptedClassName="text-gray-400 opacity-70"
                      />
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-4">
                   Trained harder than your gym bro's abs.
Smarter than YouTube's 'Up next'.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AI-powered precision</span>
                  </div>
                </div>
              </div>

              {/* Benefit 6: Discover Hidden Gems */}
              <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      <DecryptedText 
                        text="Discover Hidden Gems"
                        animateOn="hover"
                        speed={60}
                        maxIterations={10}
                        className="text-white"
                        encryptedClassName="text-gray-400 opacity-70"
                      />
                    </h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-4">
                   For when Part 1 is from 2 years ago, and YouTube forgot it.
Uncover spin-offs even the creator forgot they made.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Comprehensive discovery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16 sm:mt-20">
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="p-3 bg-white rounded-xl">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white mb-1">Ready to Complete Your Stories?</h3>
                  <p className="text-sm text-gray-400">Join thousands who never miss a part 2 again</p>
                </div>
                <button
                  onClick={scrollToSearch}
                  className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Try It Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section id="search-section" className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Enhanced Architecture Display */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-5xl mx-auto border border-white/10 shadow-2xl mb-12 sm:mb-16">
            <div className="text-sm text-gray-300 space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="font-semibold text-base sm:text-lg text-white">
                  <DecryptedText 
                    text="Enhanced AI Architecture"
                    animateOn="view"
                    speed={60}
                    maxIterations={12}
                    className="text-white"
                    encryptedClassName="text-gray-500 opacity-60"
                  />
                </span>
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <span className="font-semibold text-white">Training Dataset</span>
                  </div>
                  <p className="text-gray-400 mb-1 sm:mb-2">• 772+ synthetic training videos</p>
                  <p className="text-gray-400 mb-1 sm:mb-2">• Advanced embedding vectors</p>
                  <p className="text-gray-400">• Pattern recognition training</p>
                </div>
                
                <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Youtube className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <span className="font-semibold text-white">Live Analysis</span>
                  </div>
                  <p className="text-gray-400 mb-1 sm:mb-2">• Real-time creator data</p>
                  <p className="text-gray-400 mb-1 sm:mb-2">• YouTube API integration</p>
                  <p className="text-gray-400">• Dynamic content matching</p>
                </div>
                
                <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <span className="font-semibold text-white">Smart Learning</span>
                  </div>
                  <p className="text-gray-400 mb-1 sm:mb-2">• User feedback integration</p>
                  <p className="text-gray-400 mb-1 sm:mb-2">• Continuous improvement</p>
                  <p className="text-gray-400">• Negative example storage</p>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-4 border border-white/20">
                <p className="text-center text-gray-300 text-xs sm:text-sm">
                  <span className="font-semibold text-white">🧠 Workflow:</span> 
                  Input Video → Creator Analysis → AI Pattern Matching → Series Discovery → Continuous Learning
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Search Form - MOVED TO CENTER */}
          <div className="max-w-3xl mx-auto mb-12 sm:mb-16 flex items-center justify-center min-h-[40vh]">
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl blur-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
                      <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste YouTube URL here (e.g., youtube.com/shorts/...)"
                      className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 text-base sm:text-lg shadow-2xl"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 relative group overflow-hidden bg-white text-black py-4 sm:py-6 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Analyzing Creator's Content...</span>
                        <span className="sm:hidden">Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="hidden sm:inline">Find Series Videos</span>
                        <span className="sm:hidden">Find Videos</span>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                  
                  {seriesVideos.length > 0 && (
                    <button
                      type="button"
                      onClick={clearResults}
                      className="px-6 sm:px-8 py-4 sm:py-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all duration-300 font-medium shadow-xl"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Enhanced Feedback Statistics Dashboard */}
          {feedbackStats.totalFeedback > 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto mb-12 sm:mb-16 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-white rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Learning Progress</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center group">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative text-2xl sm:text-3xl font-black text-white bg-black/80 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto border border-white/30">
                      {feedbackStats.totalFeedback}
                    </div>
                  </div>
                  <div className="text-gray-400 font-medium text-sm">Total Feedback</div>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative text-2xl sm:text-3xl font-black text-white bg-black/80 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto border border-white/30">
                      {feedbackStats.thumbsUp}
                    </div>
                  </div>
                  <div className="text-gray-400 font-medium text-sm">👍 Positive</div>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative text-2xl sm:text-3xl font-black text-white bg-black/80 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto border border-white/30">
                      {feedbackStats.thumbsDown}
                    </div>
                  </div>
                  <div className="text-gray-400 font-medium text-sm">👎 Negative</div>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative text-2xl sm:text-3xl font-black text-white bg-black/80 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto border border-white/30">
                      {feedbackStats.negativeExamplesStored}
                    </div>
                  </div>
                  <div className="text-gray-400 font-medium text-sm">📊 Stored Examples</div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 sm:px-4 py-2 border border-white/20">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <span className="text-xs sm:text-sm text-gray-300 font-medium">
                    Every interaction improves our AI matching accuracy
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Error Message */}
          {error && (
            <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 shadow-2xl">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                </div>
                <p className="text-gray-300 text-base sm:text-lg">{error}</p>
              </div>
            </div>
          )}

          {/* Enhanced Results */}
          {seriesVideos.length > 0 && originalVideo && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 sm:mb-12 shadow-2xl">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl">
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    Found {seriesVideos.length} series videos from {originalVideo.channelTitle}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 animate-pulse" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="font-semibold text-white text-sm sm:text-base">Live Data Source</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Fetched ALL videos from creator's actual YouTube channel in real-time
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="font-semibold text-white text-sm sm:text-base">AI Matching</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Applied patterns learned from {772 + feedbackStats.negativeExamplesStored}+ training videos
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="font-semibold text-white text-sm sm:text-base">Smart Results</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Semantic similarity + title patterns + series indicators
                    </p>
                  </div>
                </div>

                {/* Enhanced Feedback Learning Display */}
                <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="font-semibold text-white text-sm sm:text-base">Continuous Learning</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                    👎 Negative feedback automatically improves our AI by storing examples
                  </p>
                  <p className="text-xs text-gray-500">
                    📊 {feedbackStats.negativeExamplesStored} negative examples added from user feedback
                  </p>
                </div>

                {feedbackCount > 0 && (
                  <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-4 border border-white/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="text-xs sm:text-sm text-gray-300 font-medium">
                        Session Learning: {feedbackCount} feedback responses collected this session
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                {seriesVideos.map((video, index) => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    index={index}
                    onFeedback={handleFeedback}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Footer */}
          <div className="text-center mt-16 sm:mt-20 pt-8 sm:pt-12 border-t border-white/20">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-gray-500 text-xs sm:text-sm">Live Creator Data</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-gray-500 text-xs sm:text-sm">AI-Trained Logic</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Database className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-gray-500 text-xs sm:text-sm">Synthetic Dataset</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-gray-500 text-xs sm:text-sm">Smart Learning</span>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              Powered by advanced AI semantic matching and continuous learning
            </p>
            
            {/* Built in Bolt Badge */}
            <div className="flex justify-center">
              <a 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-300"
              >
                <img 
                  src="https://img.shields.io/badge/Built%20in-Bolt-FF6B35?style=for-the-badge&logo=lightning&logoColor=white" 
                  alt="Built in Bolt" 
                  className="h-8"
                />
              </a>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;