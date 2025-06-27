# WhereIsPart2 - AI-Powered YouTube Series Discovery

Turn scrolling into a story. Find the complete YouTube series you've been looking for with advanced AI matching.

## 🚀 Features

- **Live Creator Analysis**: Real-time data fetched directly from YouTube for accurate results
- **AI-Powered Matching**: Advanced semantic analysis trained on 772+ videos
- **Smart Learning**: Continuous improvement through user feedback and negative example storage
- **Never Miss Part 2**: Complete series discovery with intelligent pattern recognition
- **Always Up-to-Date**: Live YouTube data integration
- **Beautiful UI**: Production-ready design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: Hugging Face Transformers API
- **APIs**: YouTube Data API v3
- **Graphics**: WebGL (OGL) + Custom Shaders

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- YouTube Data API key
- Hugging Face API key

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HF_API_KEY=your_hugging_face_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whereispart2.git
cd whereispart2
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables (see above)

4. Start the development server:
```bash
npm run dev
```

## 🗄️ Database Setup

The project uses Supabase with the following tables:

### `shorts_data` table
- Stores video embeddings and metadata
- Used for AI similarity matching
- Automatically populated through user interactions

### `feedback_data` table  
- Stores user feedback for continuous learning
- Tracks thumbs up/down responses
- Enables negative example storage

The database schema is automatically created when you connect to Supabase.

## 🚀 Deployment

### Netlify Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set the following build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add your environment variables in Netlify's dashboard
5. Deploy!

### Environment Variables for Production

Make sure to set these in your Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `VITE_HF_API_KEY`
- `VITE_YOUTUBE_API_KEY`

## 🧠 How It Works

1. **Input Processing**: User provides a YouTube URL
2. **Video Analysis**: Extract video details via YouTube API
3. **Creator Discovery**: Fetch all videos from the creator's channel
4. **AI Matching**: Generate embeddings and compute semantic similarity
5. **Smart Filtering**: Apply trained patterns and series indicators
6. **Results Display**: Show ranked matches with similarity scores
7. **Continuous Learning**: Store user feedback to improve future matches

## 📊 AI Training

The system uses:
- **Sentence Transformers**: High-quality semantic embeddings
- **Synthetic Dataset**: 772+ training examples
- **User Feedback**: Continuous learning from thumbs up/down
- **Negative Examples**: Automatic storage of irrelevant content

## 🎨 Design Features

- **Aurora Background**: Custom WebGL shader animations
- **Fluid Interactions**: Mouse-responsive particle effects
- **Decrypted Text**: Animated text reveals
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Elegant black and white aesthetic

## 🔍 API Usage

### YouTube Data API
- Video details extraction
- Channel video fetching
- Real-time data synchronization

### Hugging Face API
- Sentence transformer embeddings
- Semantic similarity computation
- Fallback embedding generation

## 📈 Performance

- **Fast Loading**: Optimized with Vite
- **Efficient Caching**: Smart API request management
- **Responsive UI**: Smooth 60fps animations
- **Scalable Architecture**: Modular component design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- YouTube Data API for video information
- Hugging Face for transformer models
- Supabase for database infrastructure
- OGL for WebGL graphics
- Tailwind CSS for styling

---

**Built with ❤️ for the YouTube community**