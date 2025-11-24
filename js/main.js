// Main application - coordinates bot, coin animation, and audio
class TTFlipper {
    constructor() {
        this.coinFlip = null;
        this.bot = null;
        this.audio = null;
        this.countdownElement = null;
        this.winnerElement = null;
    }

    init() {
        // Initialize components
        this.coinFlip = new CoinFlip('coin-canvas');
        this.bot = new TwitchBot();
        this.audio = new AudioManager();
        
        // Get DOM elements
        this.countdownElement = document.getElementById('countdown');
        this.winnerElement = document.getElementById('winner-display');
        
        // Set up bot callback
        this.bot.onFlip((result, winner, loser) => {
            this.startFlipSequence(result, winner, loser);
        });
        
        // Show connection UI
        this.showConnectionUI();
    }

    showConnectionUI() {
        // Create simple connection form
        const overlay = document.getElementById('overlay-container');
        const connectionDiv = document.createElement('div');
        connectionDiv.id = 'connection-ui';
        connectionDiv.innerHTML = `
            <div class="connection-panel">
                <h2>TT FLIPPER</h2>
                <p>Connect to Twitch Chat</p>
                <input type="text" id="channel-input" placeholder="Channel name" />
                <input type="text" id="username-input" placeholder="Bot username (optional)" />
                <input type="password" id="token-input" placeholder="OAuth token (optional)" />
                <button id="connect-btn">Connect</button>
                <p class="info">For anonymous connection, leave username and token empty.<br>
                To send messages, provide bot username and OAuth token from <a href="https://twitchapps.com/tmi/" target="_blank">twitchapps.com/tmi</a></p>
            </div>
        `;
        overlay.appendChild(connectionDiv);
        
        document.getElementById('connect-btn').addEventListener('click', () => {
            const channel = document.getElementById('channel-input').value.trim();
            const username = document.getElementById('username-input').value.trim();
            const token = document.getElementById('token-input').value.trim();
            
            if (!channel) {
                alert('Please enter a channel name');
                return;
            }
            
            this.bot.connect(
                channel,
                username || 'justinfan12345',
                token || null
            );
            
            connectionDiv.remove();
            this.showStatus(`Connected to #${channel}`);
        });
    }

    showStatus(message) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);
        
        setTimeout(() => statusDiv.remove(), 3000);
    }

    async startFlipSequence(result, winner, loser) {
        // Start countdown
        await this.countdown(3);
        
        // Play flip sound and start animation
        this.audio.playFlipSound();
        this.coinFlip.flip(result);
        
        // Wait for animation to complete (3 seconds)
        await this.sleep(3000);
        
        // Show winner
        this.displayWinner(winner);
        this.audio.playWinnerSound();
        
        // Announce in chat
        this.bot.announceWinner(winner, loser);
        
        // Clear winner display after 5 seconds
        await this.sleep(5000);
        this.clearWinner();
    }

    async countdown(seconds) {
        for (let i = seconds; i > 0; i--) {
            this.countdownElement.textContent = i;
            this.countdownElement.classList.add('show');
            this.audio.playCountdownBeep(800 + (seconds - i) * 200, 200);
            await this.sleep(1000);
        }
        this.countdownElement.classList.remove('show');
        this.countdownElement.textContent = '';
    }

    displayWinner(username) {
        this.winnerElement.textContent = `${username} WINS!`;
        this.winnerElement.classList.add('show');
    }

    clearWinner() {
        this.winnerElement.classList.remove('show');
        setTimeout(() => {
            this.winnerElement.textContent = '';
        }, 500);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TTFlipper();
    app.init();
});
