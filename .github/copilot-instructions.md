# TT FLIPPER - Copilot Instructions

## Project Overview
TT FLIPPER is a Twitch-integrated coin flip game with 3D visualization and audio. Two users challenge each other via chat commands, triggering a 3D coin flip animation with a gold coin showing "W" (Win) on front and "L" (Lose) on back.

## Core Requirements (from idea.txt)

**Twitch Integration:**
- Command: `!username` allows two users to challenge each other
- Bot must respond in Twitch chat with winner announcement
- Winner displayed both in chat and on-screen overlay

**Visual Component:**
- 3D gold coin with embossed, shiny appearance
- Front face: "W" (Win)
- Back face: "L" (Lose)
- Smooth coin flip animation with countdown
- On-screen display of winner

**Audio Component:**
- Sound effects for countdown
- Coin flip sound effects
- Winner announcement audio (optional)

## Recommended Tech Stack

**3D Graphics:**
- Three.js for browser-based 3D rendering (works with GitHub Pages)
- Vanilla JavaScript - no build step required for GitHub Pages deployment

**Twitch Integration:**
- tmi.js (browser version) for Twitch chat bot functionality in the browser
- Twitch EventSub via WebSocket for real-time events
- OAuth implicit flow for client-side authentication

**Static Hosting:**
- GitHub Pages (github.io) - fully client-side application
- No backend server required - all logic runs in browser
- Twitch bot runs client-side using tmi.js browser build

## Key Implementation Considerations

**Project Structure:**
```
/index.html       - Main overlay page for OBS browser source
/js/
  /bot.js         - Twitch chat bot (tmi.js browser version)
  /coin.js        - Three.js coin model and animation
  /main.js        - App initialization and coordination
/assets/
  /sounds/        - Audio files for countdown and flip
  /textures/      - Coin textures (gold, W/L embossing)
/css/
  /style.css      - Overlay styling
```

**Workflow:**
1. User triggers `!flip @opponent` in Twitch chat
2. Browser-based bot detects command and validates challenge
3. Bot initiates countdown with audio
4. Three.js renders coin flip animation with sound
5. Bot announces winner in chat
6. Overlay displays winner on screen
7. All running from single HTML page hosted on GitHub Pages

**GitHub Pages Deployment:**
- Site will be accessible at `https://[username].github.io/TT_FLIPPER/`
- Use for OBS browser source URL
- Twitch OAuth redirect URI must point to GitHub Pages URL
- All assets must be served via HTTPS (required for Twitch API)

**Development Priorities:**
1. Set up Twitch bot with basic chat commands
2. Create 3D coin model with W/L faces
3. Implement coin flip animation
4. Add WebSocket communication
5. Integrate audio system
6. Polish visual effects (shiny, embossed look)

## Testing Approach
- Use Twitch CLI for local bot testing
- Create mock WebSocket for overlay testing
- Test OBS browser source integration early
- Validate coin flip randomness and fairness

## Bot Name
TT FLIPPER (use this for bot username and display name)
