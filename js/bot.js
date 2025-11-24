// Twitch bot integration using native WebSocket (no tmi.js dependency)
class TwitchBot {
    constructor() {
        this.ws = null;
        this.channel = '';
        this.connected = false;
        this.activeFlip = null; // Only one flip at a time
        this.onFlipCallback = null;
    }

    connect(channel, username = 'justinfan' + Math.floor(Math.random() * 100000), password = null) {
        this.channel = channel.toLowerCase().replace('#', '');
        
        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            
            if (password) {
                this.ws.send(`PASS ${password}`);
                this.ws.send(`NICK ${username}`);
            } else {
                this.ws.send(`NICK ${username}`);
            }
            
            this.ws.send(`JOIN #${this.channel}`);
        };
        
        this.ws.onmessage = (event) => {
            const messages = event.data.split('\r\n');
            messages.forEach(msg => {
                if (msg.startsWith('PING')) {
                    this.ws.send('PONG :tmi.twitch.tv');
                } else if (msg.includes('PRIVMSG')) {
                    this.handleMessage(msg);
                } else if (msg.includes('JOIN')) {
                    console.log(`Joined #${this.channel}`);
                    this.connected = true;
                }
            });
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.connected = false;
        };
    }

    handleMessage(ircMessage) {
        // Parse IRC message: :user!user@user.tmi.twitch.tv PRIVMSG #channel :message
        const match = ircMessage.match(/:(.+)!.+@.+ PRIVMSG #\w+ :(.+)/);
        if (!match) return;
        
        const username = match[1];
        const message = match[2].trim();
        
        // Check for !flip command with any text after it as the wager
        // Examples: !flip 5 gifted, !flip $5, !flip 100 bits
        const flipMatch = message.match(/^!flip\s+(.+)/i);
        if (flipMatch) {
            const wager = flipMatch[1].trim();
            this.createFlipChallenge(username, wager);
            return;
        }
        
        // Check for !flipper to join an existing flip
        if (message.match(/^!flipper/i)) {
            this.joinFlipChallenge(username);
        }
    }

    createFlipChallenge(creator, wager) {
        if (this.activeFlip) {
            this.sendMessage(`@${creator} A flip is already active! Wait for it to complete.`);
            return;
        }
        
        this.activeFlip = {
            creator: creator,
            wager: wager,
            opponent: null,
            timestamp: Date.now()
        };
        
        this.sendMessage(`@${creator} started a coin flip for ${wager}! Type !flipper to join!`);
        
        // Clear if no one joins after 60 seconds
        setTimeout(() => {
            if (this.activeFlip && !this.activeFlip.opponent) {
                this.sendMessage(`Coin flip for ${this.activeFlip.wager} expired. No one joined.`);
                this.activeFlip = null;
            }
        }, 60000);
    }
    
    joinFlipChallenge(joiner) {
        if (!this.activeFlip) {
            this.sendMessage(`@${joiner} No active flip to join! Use !flip <wager> to start one.`);
            return;
        }
        
        if (this.activeFlip.opponent) {
            this.sendMessage(`@${joiner} This flip already has 2 players!`);
            return;
        }
        
        if (joiner.toLowerCase() === this.activeFlip.creator.toLowerCase()) {
            this.sendMessage(`@${joiner} You can't join your own flip!`);
            return;
        }
        
        this.activeFlip.opponent = joiner;
        this.executeFlip(this.activeFlip.creator, joiner, this.activeFlip.wager);
        this.activeFlip = null;
    }

    executeFlip(player1, player2, wager = null) {
        const result = Math.random() < 0.5 ? 'W' : 'L';
        const winner = result === 'W' ? player1 : player2;
        const loser = result === 'W' ? player2 : player1;
        
        if (this.onFlipCallback) {
            this.onFlipCallback(result, winner, loser, wager);
        }
    }

    sendMessage(message) {
        if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(`PRIVMSG #${this.channel} :${message}`);
        } else {
            console.log(`[BOT] ${message}`);
        }
    }

    announceWinner(winner, loser, wager = null) {
        const wagerText = wager ? ` for ${wager}` : '';
        this.sendMessage(`🪙 Coin flip complete! @${winner} wins${wagerText}! Better luck next time @${loser}!`);
    }

    onFlip(callback) {
        this.onFlipCallback = callback;
    }
}
