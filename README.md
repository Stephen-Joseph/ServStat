# Game Server Tracker

A modern web application to track and monitor your game servers in real-time. Supports **Minecraft**, **MTA:SA** (Multi Theft Auto), and **SA-MP** (San Andreas Multiplayer) servers.

![Game Server Tracker](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-teal)

## Features

- **Multi-Game Support**
  - 🟢 **Minecraft** Java & Bedrock servers
  - 🔵 **MTA:SA** (Multi Theft Auto: San Andreas)
  - 🟠 **SA-MP** (San Andreas Multiplayer)

- **Real-Time Monitoring**
  - Online/offline status
  - Player count (online/max)
  - Server ping/latency
  - Version info
  - Gamemode & map display
  - Complete player list

- **Server Management**
  - Add unlimited servers dynamically
  - Remove servers with one click
  - Individual or bulk refresh
  - Persistent storage with localStorage
  - Auto-refresh every 60 seconds

- **Modern UI**
  - Responsive design (mobile & desktop)
  - Color-coded server types
  - Server detail pages
  - Dark theme optimized
  - Smooth animations

## Screenshots

*Coming soon...*

## Live Demo

Try it out: [Live Demo](https://your-demo-link.netlify.app) *(Deploy yours below!)*

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/game-server-tracker.git
cd game-server-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Build for Production

```bash
npm run build
```

The `dist` folder will contain the production build ready for deployment.

## Deployment

### Netlify (Recommended)
1. Fork this repository
2. Connect your GitHub repo to [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### GitHub Pages
```bash
npm run build
# Upload dist folder to GitHub Pages
```

## API Sources

| Game | API Used | Notes |
|------|----------|-------|
| Minecraft | [mcsrvstat.us](https://api.mcsrvstat.us) | Reliable, CORS enabled |
| SA-MP | [samp-api.com](https://samp-api.com) | CORS enabled |
| MTA:SA | Limited browser support | May require CORS proxy |

## Browser CORS Limitations

**Note:** Due to browser security (CORS), some game server query APIs may not work directly from the browser:
- **Minecraft**: Works perfectly
- **SA-MP**: Uses samp-api.com (working)
- **MTA:SA**: Limited browser support - may show offline even if server is online

For production use with full MTA:SA support, consider setting up a backend proxy server.

## Project Structure

```
src/
├── components/
│   ├── AddServerModal.tsx    # Add server form with type selection
│   ├── Header.tsx             # Navigation header
│   └── ServerCard.tsx         # Server status card
├── hooks/
│   └── useServers.ts          # Server management & API fetching
├── pages/
│   └── ServerDetail.tsx       # Detailed server view
├── types/
│   └── server.ts              # TypeScript types
├── App.tsx                    # Main app with routing
└── main.tsx                   # Entry point
```

## Technologies

- [React 18](https://react.dev) - UI framework
- [TypeScript](https://typescriptlang.org) - Type safety
- [Vite](https://vitejs.dev) - Build tool
- [TailwindCSS](https://tailwindcss.com) - Styling
- [React Router](https://reactrouter.com) - Navigation
- [Lucide Icons](https://lucide.dev) - Icons

## Environment Variables

No environment variables required for basic usage.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE) - Free for personal and commercial use.

## Support

- Open an [issue](https://github.com/yourusername/game-server-tracker/issues) for bugs
- Star ⭐ the repo if you find it useful!

---

Made with ❤️ for the gaming community
