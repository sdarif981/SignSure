# SignSure - Secure Digital Document Signing Platform

A modern, secure document signing platform built with client-side cryptography that ensures your private keys never leave your device. SignSure provides cryptographically secure tools for signing and verifying documents while maintaining full data ownership and zero trust dependency.

## 🔒 Core Security Features

- **Zero-Knowledge Architecture**: Private keys are generated and stored exclusively on the client side
- **Client-Side Cryptography**: All encryption/decryption operations happen in your browser
- **ECDSA P-384 Digital Signatures**: Industry-standard elliptic curve cryptography
- **AES-GCM Encryption**: Secure private key encryption with user passphrases
- **QR Code Backup System**: Export encrypted private keys for secure backup
- **SHA-384 Document Hashing**: Cryptographic integrity verification

## 🏗️ Architecture

**Full-Stack MERN Application**
- **Frontend**: React 19 with Vite, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: Zustand for client-side state

## 📋 Prerequisites

Before running SignSure, ensure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or cloud instance)
- **npm** or **yarn** package manager
- **Modern web browser** with Web Crypto API support

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd signsure
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "SECRET_KEY=your_jwt_secret_key" >> .env
echo "NODE_ENV=development" >> .env
echo "PORT=5000" >> .env

# Start backend server
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
signsure/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── user.controller.js    # User auth & management
│   │   └── key.controller.js     # Public key operations
│   ├── middleware/
│   │   └── isAuthenticated.js    # JWT authentication
│   ├── models/
│   │   └── user.model.js         # User schema
│   ├── routes/
│   │   ├── user.route.js         # User API routes
│   │   └── key.route.js          # Key API routes
│   ├── utils/
│   │   ├── encrypt_key.js        # Key encryption utilities
│   │   ├── decrypt_key.js        # Key decryption utilities
│   │   └── generate_keys.js      # Key pair generation
│   └── server.js                 # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Login & Registration
│   │   │   ├── pages/            # Main application pages
│   │   │   └── ui/               # Reusable UI components
│   │   ├── utils/                # Client-side crypto functions
│   │   ├── store/                # Zustand state management
│   │   └── constants/            # API endpoints & configs
│   └── public/                   # Static assets
```

## 🔑 Key Features

### Authentication System
- **User Registration**: Secure account creation with password hashing
- **JWT Authentication**: Token-based session management
- **Protected Routes**: Client-side route protection
- **Secure Logout**: Proper session cleanup

### Document Signing Workflow
1. **Key Generation**: Generate ECDSA P-384 key pairs in browser
2. **Private Key Encryption**: Encrypt private key with user passphrase
3. **Document Upload**: Support for PDF, DOC, DOCX, TXT, JSON files
4. **Digital Signing**: Generate cryptographic signatures (SHA-384 + ECDSA)
5. **Signature Export**: Download `.sig.txt` files with signature data

### Document Verification
1. **File Upload**: Original document, signature file, and public key
2. **Signature Validation**: Cryptographic verification of authenticity
3. **Integrity Check**: Verify document hasn't been tampered with
4. **Clear Results**: User-friendly verification status

### Security Features
- **QR Code Backup**: Export encrypted private keys as QR codes
- **Public Key Download**: Export public keys for sharing
- **Local Storage**: Encrypted private key storage in browser
- **No Server-Side Keys**: Zero knowledge of private keys

## 🔧 API Endpoints

### User Management
```
POST /api/user/register    # Create new user account
POST /api/user/login       # Authenticate user
GET  /api/user/logout      # End user session
```

### Key Operations
```
GET  /api/key/public_key   # Retrieve user's public key (authenticated)
```

## 🛠️ Technology Stack

### Backend Dependencies
- **Express.js**: Web framework
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT implementation
- **cors**: Cross-origin resource sharing
- **cookie-parser**: Cookie parsing middleware
- **crypto**: Node.js cryptographic utilities

### Frontend Dependencies
- **React 19**: UI library with latest features
- **Vite**: Fast build tool and dev server
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Radix UI**: Headless UI primitives
- **Zustand**: Lightweight state management
- **Axios**: HTTP client for API requests
- **QRCode.js**: QR code generation
- **jsQR**: QR code reading
- **file-saver**: File download utilities
- **Sonner**: Toast notifications

## 🔐 Cryptographic Implementation

### Key Generation
```javascript
// ECDSA P-384 key pair generation
const keyPair = await window.crypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-384" },
  true,
  ["sign", "verify"]
);
```

### Private Key Encryption
```javascript
// AES-GCM encryption with PBKDF2 key derivation
const encrypted = await window.crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  aesKey,
  privateKeyBuffer
);
```

### Document Signing
```javascript
// SHA-384 + ECDSA signature generation
const signature = await window.crypto.subtle.sign(
  { name: "ECDSA", hash: { name: "SHA-384" } },
  privateKey,
  documentBuffer
);
```

## 🚦 Development Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend
```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📱 Browser Compatibility

SignSure requires modern browsers with Web Crypto API support:
- Chrome 70+
- Firefox 80+
- Safari 14+
- Edge 79+

## ⚠️ Security Considerations

1. **Passphrase Security**: Use strong, unique passphrases for private key encryption
2. **QR Code Storage**: Store QR code backups securely offline
3. **Browser Security**: Only use on trusted devices and networks
4. **Key Recovery**: Lost passphrases cannot be recovered - backup QR codes are essential
5. **HTTPS Only**: Always use HTTPS in production environments

## 🌐 Deployment

### Backend Deployment
1. Set production environment variables
2. Use MongoDB Atlas or hosted MongoDB
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Configure CORS for your frontend domain

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Update API endpoints in constants

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

<!-- ## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

<!-- ## 🆘 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Contact the development team
- Review documentation and code comments -->

## 🔮 Future Enhancements

- [ ] Multi-signature document support
- [ ] Blockchain integration for signature verification
- [ ] Mobile application development
- [ ] Enterprise SSO integration
- [ ] Advanced document templates
- [ ] Batch signing capabilities
- [ ] API key management for third-party integrations

---

**⚡ SignSure - Your documents, your keys, your security.** Built with modern cryptography and zero-trust principles.