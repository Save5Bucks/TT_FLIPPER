# TT FLIPPER

A Twitch-integrated 3D coin flip game with real-time chat interaction and visual overlay.

## Features

- 🎮 **Twitch Chat Integration** - Users challenge each other with `!flip @username`
- 🪙 **3D Coin Animation** - Beautiful gold coin with W (Win) and L (Lose) faces
- 🎵 **Audio Effects** - Countdown beeps, coin flip sounds, and victory fanfare
- 📺 **OBS Ready** - Browser source overlay for streaming
- 🌐 **GitHub Pages** - Fully client-side, hosted on github.io

## Quick Start

### 1. Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Set source to `main` branch
4. Your site will be at `https://[username].github.io/TT_FLIPPER/`

### 2. Add to OBS

1. Add a "Browser" source in OBS
2. Set URL to your GitHub Pages URL
3. Set width: 1920, height: 1080
4. Check "Shutdown source when not visible"

### 3. Connect to Twitch

1. Open the overlay in your browser
2. Enter your Twitch channel name
3. (Optional) Add bot username and OAuth token for chat responses
   - Get OAuth token from [twitchapps.com/tmi](https://twitchapps.com/tmi/)

## How to Play

1. User A types: `!flip @UserB`
2. User B accepts by typing: `!flip @UserA`
3. Countdown begins (3, 2, 1)
4. Coin flips with animation
5. Winner displayed on screen and announced in chat!

## Commands

- `!flip @username` - Challenge another user or accept a challenge

## Tech Stack

- **Three.js** - 3D graphics rendering
- **tmi.js** - Twitch chat integration
- **Web Audio API** - Procedural sound effects
- **Vanilla JavaScript** - No build tools required

## File Structure

```text
/index.html           - Main overlay page
/js/
  /audio.js          - Audio manager with Web Audio API
  /bot.js            - Twitch chat bot logic
  /coin.js           - 3D coin model and animation
  /main.js           - App coordinator
/css/
  /style.css         - Overlay styling
/assets/
  /sounds/           - Custom sound effects (optional)
```

## Customization

### Change Coin Appearance

Edit `js/coin.js` → `createTextTexture()` to modify W/L text styling

### Adjust Animation Duration

Edit `js/coin.js` → `flip()` → `duration` variable (default: 3000ms)

### Custom Sounds

Add audio files to `/assets/sounds/` and load them in `js/audio.js`

### Countdown Time

Edit `js/main.js` → `startFlipSequence()` → `countdown(3)` parameter

## Development

Simply open `index.html` in a browser or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

Then visit `http://localhost:8000`

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support

## License

MIT License - Feel free to modify and use!

## Credits

Built for Twitch streamers who want interactive coin flip challenges.
