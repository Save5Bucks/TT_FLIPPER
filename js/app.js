// Main application - coordinates bot, coin animation, and audio
class TTFlipper {
    constructor() {
        this.coinFlip = null;
        this.bot = null;
        this.audio = null;
        this.countdownElement = null;
        this.winnerElement = null;
        this.playerNamesElement = null;
        this.wagerDisplayElement = null;
        this.startFlipBtn = null;
        this.pendingFlip = null;
        this.wagerAmount = null;
    }

    init() {
        // Initialize components
        this.coinFlip = new CoinFlip('coin-canvas');
        this.bot = new TwitchBot();
        this.audio = new AudioManager();
        
        // Get DOM elements
        this.countdownElement = document.getElementById('countdown');
        this.winnerElement = document.getElementById('winner-display');
        this.playerNamesElement = document.getElementById('player-names');
        this.wagerDisplayElement = document.getElementById('wager-display');
        this.startFlipBtn = document.getElementById('start-flip-btn');
        
        // Set up start button click handler
        this.startFlipBtn.addEventListener('click', () => {
            if (this.pendingFlip) {
                const { result, winner, loser, wager } = this.pendingFlip;
                this.pendingFlip = null;
                this.startFlipSequence(result, winner, loser, wager);
            } else {
                // Manual flip with test players
                const result = Math.random() < 0.5 ? 'W' : 'L';
                this.startFlipSequence(result, 'Player1', 'Player2', null);
            }
        });
        
        // Set up bot callback
        this.bot.onFlip((result, winner, loser, wager) => {
            // Store the flip data
            this.pendingFlip = { result, winner, loser, wager };
            this.displayPlayerNames(winner, loser);
            if (wager) {
                this.displayWager(wager);
            }
        });
        
        // Show connection UI
        this.showConnectionUI();
    }

    showConnectionUI() {
        // Connection UI temporarily disabled
        /*
        // Check if we have saved settings
        const savedChannel = localStorage.getItem('ttflipper_channel');
        const savedUsername = localStorage.getItem('ttflipper_username');
        const savedToken = localStorage.getItem('ttflipper_token');
        
        // If we have saved channel, auto-connect
        if (savedChannel) {
            this.bot.connect(savedChannel, savedUsername, savedToken);
            this.showStatus(`Auto-connected to #${savedChannel}`);
            return;
        }
        
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
                <label class="checkbox-label">
                    <input type="checkbox" id="save-settings" checked />
                    Remember these settings
                </label>
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
            const saveSettings = document.getElementById('save-settings').checked;
            
            if (!channel) {
                alert('Please enter a channel name');
                return;
            }
            
            // Save settings if checkbox is checked
            if (saveSettings) {
                localStorage.setItem('ttflipper_channel', channel);
                if (username) localStorage.setItem('ttflipper_username', username);
                if (token) localStorage.setItem('ttflipper_token', token);
            }
            
            this.bot.connect(
                channel,
                username || 'justinfan12345',
                token || null
            );
            
            connectionDiv.remove();
            this.showStatus(`Connected to #${channel}`);
        });
        */
    }

    showStatus(message) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);
        
        setTimeout(() => statusDiv.remove(), 3000);
    }

    async startFlipSequence(result, winner, loser, wager = null) {
        // Disable the flip button during animation
        this.startFlipBtn.disabled = true;
        
        // Clear any previous winner display
        this.winnerElement.classList.remove('show');
        this.winnerElement.textContent = '';
        
        // Skip countdown - start flip immediately
        
        // Play flip sound and start animation
        this.audio.playFlipSound();
        this.coinFlip.flip(result);
        
        // Wait for animation to complete (3 seconds)
        await this.sleep(3000);
        
        // Show winner
        this.displayWinner(winner, wager);
        this.audio.playWinnerSound();
        
        // Announce in chat
        this.bot.announceWinner(winner, loser, wager);
        
        // Clear winner display after 5 seconds
        await this.sleep(5000);
        this.clearWinner();
        
        // Re-enable the flip button
        this.startFlipBtn.disabled = false;
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

    displayWinner(username, wager = null) {
        const result = this.coinFlip.lastResult === 'W' ? 'HEADS' : 'TAILS';
        this.winnerElement.textContent = result;
        this.winnerElement.classList.add('show');
    }

    clearWinner() {
        this.winnerElement.classList.remove('show');
        this.playerNamesElement.classList.remove('show');
        this.clearWager();
        
        // Clear the text immediately after fade-out
        setTimeout(() => {
            this.winnerElement.textContent = '';
            this.playerNamesElement.innerHTML = '';
            this.wagerDisplayElement.textContent = '';
        }, 500);
    }
    
    displayPlayerNames(player1, player2) {
        this.playerNamesElement.innerHTML = `
            <div>${player1}</div>
            <div class="vs">VS</div>
            <div>${player2}</div>
        `;
        this.playerNamesElement.classList.add('show');
    }
    
    displayWager(wager) {
        this.wagerDisplayElement.textContent = `Wager: ${wager}`;
        this.wagerDisplayElement.style.opacity = '1';
    }
    
    clearWager() {
        this.wagerDisplayElement.style.opacity = '0';
        setTimeout(() => {
            this.wagerDisplayElement.textContent = '';
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
