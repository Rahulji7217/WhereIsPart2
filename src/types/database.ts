export interface ShortsData {
  id?: number
  video_id: string
  title: string
  description: string
  channel_id: string
  published_at: string
  embedding: number[]
  created_at?: string
  score?: number // Added during similarity matching
}

export interface Database {
  public: {
    Tables: {
      shorts_data: {
        Row: ShortsData
        Insert: Omit<ShortsData, 'id' | 'created_at'>
        Update: Partial<Omit<ShortsData, 'id'>>
      }
    }
  }
}