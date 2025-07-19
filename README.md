# PaletteCraft 🎨

A modern web application for generating and managing beautiful color palettes from images. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🏠 Home - Color Palette Generator
- **Image Upload**: Drag & drop or click to upload images (PNG, JPG, GIF, WebP)
- **Color Extraction**: Uses ColorThief to extract dominant colors from images
- **Tailwind Config Generation**: Automatically generates Tailwind CSS configurations
- **Real-time Preview**: See your color palette instantly with hex codes
- **Save to Library**: Save palettes for future use

### 📚 Library - Palette Management
- **Palette Collection**: View all your saved color palettes
- **Search & Filter**: Find palettes quickly with search functionality
- **Public/Private Control**: Mark palettes as public or private
- **Image Optimization**: Automatic image resizing and compression for storage
- **Tailwind Config Export**: Download configurations as JSON files
- **Sharing**: Share individual palettes or your entire library

### ⚙️ Settings - Customization
- **Theme Control**: Light, dark, or system theme preference
- **Auto-generation**: Toggle automatic Tailwind config generation
- **Tailwind Version**: Choose between v3 or v4 configurations
- **Auto-save**: Automatically save generated palettes
- **Default Privacy**: Set default access level for new palettes

### 👤 Profile - User Management
- **Profile Information**: Update name, email, and profile picture
- **Public URL**: Create a custom URL for your public library
- **Avatar Upload**: Upload and manage profile pictures
- **Account Information**: View account creation and update dates

### 📖 Special Pages
- **Changelog**: Stay updated with new features and improvements
- **Roadmap**: See what's coming next to PaletteCraft

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Color Extraction**: ColorThief
- **Testing**: Jest + React Testing Library
- **UI Components**: Headless UI + Custom Catalyst UI Kit

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── library/           # Palette library pages
│   ├── palette/           # Public palette sharing
│   ├── profile/           # User profile management
│   ├── settings/          # Application settings
│   ├── changelog/         # Feature updates
│   ├── roadmap/           # Future features
│   └── components/        # Catalyst UI components
├── components/            # Reusable React components
│   ├── layout/           # Layout components
│   └── navigation/       # Navigation components
├── contexts/             # React contexts (Auth)
├── lib/                  # Utility functions
│   ├── supabase.ts      # Supabase client
│   ├── color-utils.ts   # Color manipulation utilities
│   └── utils.ts         # General utilities
├── types/               # TypeScript type definitions
└── __tests__/          # Test files
```

## Database Schema

### Tables

#### `profiles`
- User profile information (name, avatar, public URL)

#### `palettes`
- Color palette data with source images and Tailwind configs
- Privacy controls (public/private)

#### `user_settings`
- User preferences for theme, auto-generation, etc.

## Key Features Implementation

### Color Extraction
- Uses ColorThief library to analyze uploaded images
- Extracts dominant color and color palette (up to 8 colors)
- Converts RGB values to hex format for web use

### Tailwind Configuration Generation
- Automatically generates semantic color names based on hue and lightness
- Supports both Tailwind v3 and v4 formats
- Provides ready-to-use configuration objects

### Image Optimization
- Automatic compression and resizing for storage efficiency
- Converts images to JPEG format for better compression
- Maintains aspect ratio while reducing file size

### Sharing & Privacy
- Individual palette sharing with public URLs
- Public library pages for users
- Privacy controls with granular access settings

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/seanmishra/palettecraft.git
cd palettecraft
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations (set up tables in Supabase)

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [ColorThief](https://lokeshdhakar.com/projects/color-thief/) for color extraction
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) for backend services
- [Headless UI](https://headlessui.com/) for accessible UI components