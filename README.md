# 🤖 AI Caption Generator

A full-stack web application that generates engaging social media captions using AI, with support for multiple languages, batch processing, and comprehensive user management.

![AI Caption Generator](https://img.shields.io/badge/AI-Caption%20Generator-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18.0+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-blue)

## ✨ Features

### 🎯 Core Features

- **🤖 AI-Powered Caption Generation**: Generate engaging captions using Google Gemini AI
- **🌍 Multi-Language Support**: 12 languages including English, Spanish, French, German, Japanese, Korean, Hindi, Arabic, and more
- **📦 Batch Processing**: Upload and process multiple images simultaneously
- **🎨 Multiple Caption Styles**: Professional, Fun, Dramatic, Minimal, Adventurous, and Wholesome vibes
- **🎭 Custom Prompts**: Add personalized context to enhance caption generation

### 🔐 Authentication & Security

- **🔒 JWT Authentication**: Secure 1-hour token-based authentication with automatic expiry
- **🛡️ Rate Limiting**: Advanced protection against abuse and spam
- **✅ Input Validation**: Comprehensive data validation and sanitization
- **📁 Secure File Upload**: Image validation and processing with 4MB limit
- **🔄 Session Management**: Real-time token status tracking

### 🎨 User Experience

- **📱 Responsive Design**: Mobile-first design optimized for all devices (phone, tablet, desktop)
- **🌙 Dark/Light Theme**: User preference theme switching with system detection
- **⚡ Real-time Updates**: Live caption generation progress and status
- **🔗 Social Sharing**: Share generated posts across multiple platforms
- **⌨️ Keyboard Shortcuts**: Quick navigation and actions
- **🎯 Touch Optimized**: Enhanced touch interactions for mobile devices

### 📊 Analytics & Management

- **📈 Performance Dashboard**: User analytics and insights tracking
- **📋 Caption Analytics**: Track which styles and languages perform best
- **👤 User Profiles**: Complete profile management with post history
- **📝 Post Management**: Edit, categorize, and organize generated posts
- **🕒 Token Indicator**: Real-time session expiry countdown

### 🚀 Technical Features

- **🏗️ Modern Architecture**: Clean separation of concerns with modular design
- **🔄 Error Boundaries**: Graceful error handling and recovery
- **⚡ Performance Optimized**: Lazy loading, code splitting, and optimized renders
- **🧪 Image Processing**: Advanced image upload with validation and optimization
- **📊 Monitoring**: Built-in performance tracking and analytics

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **MongoDB** (Local or Atlas)
- **ImageKit Account** (for image storage)
- **Google Gemini API Key** (for AI generation)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ronakbagdai/ai-caption-generator.git
cd ai-caption-generator
```

2. **Backend Setup**

```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
```

3. **Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

4. **Environment Configuration**

**Backend (.env)**

```env
PORT=3000
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/caption-generator
JWT_SECRET=your_super_secure_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local)**

```env
VITE_API_BASE_URL=http://localhost:3000
```

5. **Run the Application**

```bash
# Start backend server (from root directory)
npm start

# In a new terminal, start frontend server
cd frontend
npm run dev
```

6. **Access the Application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🛠️ Technology Stack

### Backend

- **⚡ Node.js & Express.js**: Server framework with RESTful API
- **🗄️ MongoDB & Mongoose**: NoSQL database with object modeling
- **🔐 JWT (jsonwebtoken)**: Stateless authentication
- **📁 Multer**: Multipart form data and file upload handling
- **🤖 Google Gemini AI**: Advanced AI caption generation
- **🖼️ ImageKit**: Cloud image storage and optimization
- **🛡️ Express Rate Limit**: API rate limiting and abuse prevention
- **✅ Validator.js**: Input validation and sanitization
- **🔒 bcryptjs**: Password hashing and security

### Frontend

- **⚛️ React 18**: Modern UI framework with hooks and concurrent features
- **⚡ Vite**: Lightning-fast build tool and dev server
- **🎨 Tailwind CSS**: Utility-first CSS framework
- **🧭 React Router Dom**: Client-side routing and navigation
- **📡 Axios**: Promise-based HTTP client
- **🎯 React Context**: State management for auth and theme
- **🔔 Custom Toast System**: User notifications and feedback
- **📱 Responsive Design**: Mobile-first approach

### Development Tools

- **📦 npm**: Package management
- **🔧 ESLint**: Code linting and quality
- **🎨 PostCSS**: CSS processing
- **🏗️ Modular Architecture**: Clean code organization

## 🏗️ Project Structure

```
ai-caption-generator/
├── 📁 src/                    # Backend source code
│   ├── 🎮 controller/         # Route controllers and business logic
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   └── user.controller.js
│   ├── 🗄️ models/            # MongoDB schemas and models
│   │   ├── user.model.js
│   │   └── post.model.js
│   ├── 🛣️ routes/            # API route definitions
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   └── user.routes.js
│   ├── 🔧 service/           # External service integrations
│   │   ├── ai.service.js
│   │   └── storage.service.js
│   ├── 🛡️ middlewares/       # Custom middleware functions
│   │   ├── auth.middleware.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   └── 🗄️ db/               # Database configuration
│       └── db.js
├── 📁 frontend/              # Frontend React application
│   ├── 📁 src/
│   │   ├── 🧩 components/    # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── TokenIndicator.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── ...
│   │   ├── 📄 pages/         # Main page components
│   │   │   ├── Login.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── Feed.jsx
│   │   │   └── ...
│   │   ├── 🔄 context/       # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── 🎣 hooks/         # Custom React hooks
│   │   ├── 🔧 utils/         # Utility functions
│   │   ├── 🌐 api/          # API integration layer
│   │   └── 🎨 styles/       # Global styles
│   └── 📁 public/           # Static assets
├── 📋 README.md
├── 📄 package.json
└── 🔧 .env.example
```

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
MONGO_URL=your_production_mongodb_url
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### Deployment Options

- **🚀 Vercel/Netlify**: Frontend deployment
- **☁️ Railway/Render**: Full-stack deployment
- **🐳 Docker**: Containerized deployment
- **☁️ AWS/Azure**: Cloud infrastructure deployment

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **💾 Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **📤 Push to the branch** (`git push origin feature/amazing-feature`)
5. **🔄 Open a Pull Request**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ronak Bagdai**

- 🐙 GitHub: [@ronakbagdai](https://github.com/ronakbagdai)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/ronakbagdai)

## 🙏 Acknowledgments

- **🤖 Google Gemini AI** for powerful caption generation capabilities
- **🖼️ ImageKit** for reliable image processing and storage
- **🎨 Tailwind CSS** for excellent utility-first styling
- **⚛️ React Community** for amazing ecosystem and tools
- **🌐 Open Source Community** for all the incredible libraries used

## 📊 Project Stats

- **Languages**: 12 supported languages
- **Authentication**: JWT with 1-hour expiry
- **File Upload**: 4MB limit with validation
- **Rate Limiting**: 300 requests/15min general, 50 auth/15min
- **Mobile Optimized**: Touch-friendly interface
- **Theme Support**: Dark/Light mode with system detection
- **Performance**: Optimized for speed and user experience

---

⭐ **Star this repository if you found it helpful!**

📞 **Questions?** Open an issue or reach out via LinkedIn!
