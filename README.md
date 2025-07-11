# Student Collaboration Hub

A fullstack web application for students to connect, share academic resources, and discover opportunities. Built with React, Node.js, Express, and MongoDB.

## 🚀 Features

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-backend-connection-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### User Management
- **User Registration & Authentication**: Secure JWT-based authentication
- **User Profiles**: Complete profiles with university, major, year, and bio
- **Follow/Unfollow System**: Connect with other students
- **Profile Management**: Update personal information and settings

### Content Management
- **Posts**: Share notes and job opportunities
- **Categories**: Academic, Project, Research, Internship, Part-time, Full-time, Freelance
- **Tags**: Add relevant tags to posts for better discoverability
- **Like System**: Like posts to show appreciation
- **Comments**: Comment on posts with nested replies support
- **Privacy Controls**: Public/private post visibility

### User Experience
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Updates**: Instant feedback for likes, comments, and follows
- **Search & Filter**: Find posts and users easily
- **Mobile Responsive**: Works perfectly on all devices
- **Dark Mode Ready**: Clean, accessible interface

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** for cross-origin requests

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-collab-hub
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend (.env file in server directory)
```bash
cd server
cp env.example .env
```

Edit the `.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/student-collab-hub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Database Setup
Make sure MongoDB is running on your system or use MongoDB Atlas:

**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `MONGODB_URI` in your `.env` file

### 5. Start the Application

#### Development Mode (Both Frontend & Backend)
```bash
# From the root directory
npm run dev
```

#### Separate Development Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Backend Connection Guide

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

#### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:userId` - Get user profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user
- `GET /api/users/:userId/followers` - Get user's followers
- `GET /api/users/:userId/following` - Get user's following

#### Posts
- `GET /api/posts` - Get all posts (with filters)
- `GET /api/posts/:postId` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/like` - Like/unlike post
- `GET /api/posts/user/:userId` - Get user's posts

#### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment
- `POST /api/comments/:commentId/like` - Like/unlike comment
- `GET /api/comments/:commentId/replies` - Get comment replies

### Database Models

#### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  fullName: String,
  bio: String,
  avatar: String,
  university: String,
  major: String,
  year: Number,
  followers: [User IDs],
  following: [User IDs],
  isVerified: Boolean
}
```

#### Post Model
```javascript
{
  author: User ID,
  type: 'note' | 'job',
  title: String,
  content: String,
  category: String,
  tags: [String],
  likes: [User IDs],
  comments: [Comment IDs],
  views: Number,
  isPublic: Boolean,
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### Comment Model
```javascript
{
  author: User ID,
  post: Post ID,
  parentComment: Comment ID (for replies),
  content: String,
  likes: [User IDs],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Build the React app:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/build`
   - Add environment variables for your backend URL

### Backend Deployment (Render/Railway/Heroku)

1. **Prepare for deployment:**
   - Update CORS settings to allow your frontend domain
   - Set environment variables (MONGODB_URI, JWT_SECRET, etc.)
   - Ensure all dependencies are in package.json

2. **Deploy to your preferred platform:**
   - **Render**: Connect GitHub repo, set build command: `npm install`
   - **Railway**: Connect GitHub repo, auto-detects Node.js
   - **Heroku**: Connect GitHub repo, set buildpacks

3. **Update frontend API URLs:**
   - Replace `http://localhost:5001` with your deployed backend URL

### Environment Variables for Production

```env
# Backend (.env)
PORT=5000
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend (Netlify environment variables)
REACT_APP_API_URL=https://your-backend-url.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for students everywhere**
  jobDetails: Object (for job posts),
  noteDetails: Object (for note posts)
}
```

#### Comment Model
```javascript
{
  author: User ID,
  post: Post ID,
  content: String,
  parentComment: Comment ID (for replies),
  replies: [Comment IDs],
  likes: [User IDs],
  isEdited: Boolean
}
```

### Authentication Flow

1. **Registration**: User provides credentials → Password hashed → JWT token generated
2. **Login**: User provides credentials → Password verified → JWT token generated
3. **Protected Routes**: JWT token verified on each request
4. **Token Storage**: JWT stored in localStorage for persistence

### Error Handling

The API returns consistent error responses:
```javascript
{
  message: "Error description",
  errors: [] // Validation errors if any
}
```

## 🎨 Frontend Features

### Component Structure
```
src/
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   └── PostCard.tsx        # Post display component
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── pages/
│   ├── Home.tsx           # Landing page
│   ├── Login.tsx          # Login form
│   ├── Register.tsx       # Registration form
│   ├── Profile.tsx        # User profile
│   ├── CreatePost.tsx     # Post creation
│   ├── PostDetail.tsx     # Post detail view
│   ├── UserProfile.tsx    # Other user profiles
│   └── Explore.tsx        # User discovery
└── App.tsx                # Main application component
```

### State Management
- **React Context**: For authentication state
- **Local State**: For component-specific data
- **API Integration**: Axios for HTTP requests

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable styled components
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build the application
cd client
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication
- **Input Validation**: Express validator for API inputs
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Sensitive data protection

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your environment variables
3. Ensure MongoDB is running
4. Check the API endpoints are accessible

## 🔮 Future Enhancements

- Real-time messaging
- File uploads for posts
- Advanced search filters
- Email notifications
- Push notifications
- Dark mode
- Internationalization
- Advanced analytics
- Admin dashboard 