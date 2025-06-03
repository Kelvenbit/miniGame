// 记忆卡片游戏逻辑
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.isGameActive = false;
        this.startTime = null;
        this.timer = null;
        this.currentDifficulty = 'easy';
        this.isFlipping = false;
        this.hintUsed = 0;
        this.maxHints = 3;
        this.combo = 0;
        this.maxCombo = 0;
        this.averageTimePerMatch = 0;
        this.lastMatchTime = null;
        this.isPaused = false;
        
        // 难度配置
        this.difficulties = {
            easy: { rows: 3, cols: 4, name: '简单' },
            medium: { rows: 4, cols: 4, name: '中等' },
            hard: { rows: 4, cols: 6, name: '困难' },
            expert: { rows: 6, cols: 6, name: '专家' }
        };
        
        // 卡片图案符号
        this.symbols = [
            { symbol: '♠', class: 'symbol-spade' },
            { symbol: '♥', class: 'symbol-heart' },
            { symbol: '♣', class: 'symbol-club' },
            { symbol: '♦', class: 'symbol-diamond' },
            { symbol: '★', class: 'symbol-star' },
            { symbol: '●', class: 'symbol-circle' },
            { symbol: '■', class: 'symbol-square' },
            { symbol: '▲', class: 'symbol-triangle' },
            { symbol: '⬟', class: 'symbol-hexagon' },
            { symbol: '◆', class: 'symbol-diamond' },
            { symbol: '▼', class: 'symbol-triangle' },
            { symbol: '○', class: 'symbol-circle' },
            { symbol: '□', class: 'symbol-square' },
            { symbol: '☆', class: 'symbol-star' },
            { symbol: '♫', class: 'symbol-music' },
            { symbol: '♀', class: 'symbol-venus' },
            { symbol: '♂', class: 'symbol-mars' },
            { symbol: '☀', class: 'symbol-sun' }
        ];
        
        this.initializeDOM();
        this.setupEventListeners();
    }
    
    initializeDOM() {
        this.elements = {
            gameArea: document.getElementById('gameArea'),
            gameOverlay: document.getElementById('gameOverlay'),
            cardsGrid: document.getElementById('cardsGrid'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            difficultyButtons: document.querySelectorAll('.difficulty-btn'),
            
            // 头部显示
            score: document.getElementById('score'),
            timer: document.getElementById('timer'),
            
            // 信息面板
            currentScore: document.getElementById('currentScore'),
            currentTime: document.getElementById('currentTime'),
            currentFlips: document.getElementById('currentFlips'),
            currentMatches: document.getElementById('currentMatches'),
            remainingPairs: document.getElementById('remainingPairs'),
            accuracy: document.getElementById('accuracy'),
            currentDifficulty: document.getElementById('currentDifficulty'),
            gameStatus: document.getElementById('gameStatus'),
            
            // 控制按钮
            hintBtn: document.getElementById('hintBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            hintText: document.getElementById('hintText'),
            
            // 进度面板
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            matchedPairs: document.getElementById('matchedPairs'),
            totalPairs: document.getElementById('totalPairs'),
            comboCount: document.getElementById('comboCount'),
            maxCombo: document.getElementById('maxCombo'),
            
            // 计分面板
            baseScore: document.getElementById('baseScore'),
            timeBonus: document.getElementById('timeBonus'),
            comboBonus: document.getElementById('comboBonus'),
            completionBonus: document.getElementById('completionBonus'),
            
            // 统计面板
            totalFlips: document.getElementById('totalFlips'),
            successRate: document.getElementById('successRate'),
            avgTime: document.getElementById('avgTime'),
            bestTime: document.getElementById('bestTime'),
            
            // 游戏统计
            gameStats: document.getElementById('gameStats'),
            finalTime: document.getElementById('finalTime'),
            finalScore: document.getElementById('finalScore'),
            flipCount: document.getElementById('flipCount'),
            matchCount: document.getElementById('matchCount'),
            
            // 覆盖层
            overlayTitle: document.getElementById('overlayTitle'),
            overlayText: document.getElementById('overlayText'),
            difficultySelector: document.getElementById('difficultySelector')
        };
        
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // 开始游戏按钮
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 难度选择
        this.elements.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.difficultyButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.level;
            });
        });
        
        // 控制按钮
        this.elements.hintBtn.addEventListener('click', () => this.giveHint());
        this.elements.shuffleBtn.addEventListener('click', () => this.shuffleCards());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.restartGame());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    startGame() {
        this.isGameActive = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.lastMatchTime = Date.now();
        this.score = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.hintUsed = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.averageTimePerMatch = 0;
        this.flippedCards = [];
        
        const difficulty = this.difficulties[this.currentDifficulty];
        this.totalPairs = (difficulty.rows * difficulty.cols) / 2;
        
        this.createCards();
        this.shuffleCards();
        this.renderGame();
        
        this.elements.gameOverlay.style.display = 'none';
        this.elements.gameStatus.textContent = '游戏进行中';
        this.elements.difficultySelector.style.display = 'none';
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        
        this.startTimer();
        this.updateDisplay();
    }
    
    createCards() {
        this.cards = [];
        const difficulty = this.difficulties[this.currentDifficulty];
        const totalCards = difficulty.rows * difficulty.cols;
        const pairsNeeded = totalCards / 2;
        
        // 创建卡片对
        for (let i = 0; i < pairsNeeded; i++) {
            const symbol = this.symbols[i % this.symbols.length];
            // 每个图案创建两张卡片
            for (let j = 0; j < 2; j++) {
                this.cards.push({
                    id: `card-${i}-${j}`,
                    symbol: symbol.symbol,
                    class: symbol.class,
                    pairId: i,
                    isFlipped: false,
                    isMatched: false
                });
            }
        }
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        // 重新分配ID
        this.cards.forEach((card, index) => {
            card.id = `card-${index}`;
        });
    }
    
    renderGame() {
        const difficulty = this.difficulties[this.currentDifficulty];
        
        // 清空网格
        this.elements.cardsGrid.innerHTML = '';
        this.elements.cardsGrid.className = `cards-grid ${this.currentDifficulty}`;
        
        // 创建卡片元素
        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            this.elements.cardsGrid.appendChild(cardElement);
        });
    }
    
    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card';
        cardEl.dataset.cardId = card.id;
        
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back">?</div>
                <div class="card-face card-front">
                    <span class="card-symbol ${card.class}">${card.symbol}</span>
                </div>
            </div>
        `;
        
        // 根据卡片状态设置样式和事件
        if (card.isMatched) {
            // 匹配的卡片 - 锁定为翻开状态
            cardEl.classList.add('matched', 'flipped');
            cardEl.style.pointerEvents = 'none';
            cardEl.style.cursor = 'default';
            
            const cardInner = cardEl.querySelector('.card-inner');
            cardInner.style.transform = 'rotateY(180deg)';
            cardInner.style.transition = 'none';
            
            const cardFront = cardEl.querySelector('.card-front');
            cardFront.style.transform = 'rotateY(0deg)';
            cardFront.style.backfaceVisibility = 'visible';
        } else if (card.isFlipped) {
            // 翻开但未匹配的卡片
            cardEl.classList.add('flipped');
            cardEl.addEventListener('click', () => this.flipCard(card));
        } else {
            // 未翻开的卡片
            cardEl.addEventListener('click', () => this.flipCard(card));
        }
        
        return cardEl;
    }
    
    flipCard(card) {
        // 强化检查：绝对不允许操作已匹配的卡片
        if (!this.isGameActive || this.isPaused || this.isFlipping || 
            card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }
        
        // 翻开卡片
        card.isFlipped = true;
        this.flippedCards.push(card);
        this.moves++;
        
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        cardElement.classList.add('flipped');
        
        this.updateDisplay();
        
        // 检查是否有两张卡片被翻开
        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    }
    
    checkMatch() {
        this.isFlipping = true;
        const [card1, card2] = this.flippedCards;
        
        // 立即检查匹配，不使用延迟
        if (card1.pairId === card2.pairId) {
            // 匹配成功 - 立即处理
            this.handleMatchImmediate(card1, card2);
        } else {
            // 匹配失败 - 延迟翻回
            setTimeout(() => {
                this.handleMismatch(card1, card2);
                this.flippedCards = [];
                this.isFlipping = false;
                this.updateDisplay();
            }, 1000);
            return;
        }
        
        this.flippedCards = [];
        this.isFlipping = false;
        this.updateDisplay();
    }
    
    handleMatchImmediate(card1, card2) {
        // 立即设置匹配状态
        card1.isMatched = true;
        card2.isMatched = true;
        card1.isFlipped = true;
        card2.isFlipped = true;
        this.matchedPairs++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // 获取卡片元素
        const cardEl1 = document.querySelector(`[data-card-id="${card1.id}"]`);
        const cardEl2 = document.querySelector(`[data-card-id="${card2.id}"]`);
        
        // 立即锁定卡片状态 - 使用最直接的方法
        this.lockCardAsMatched(cardEl1);
        this.lockCardAsMatched(cardEl2);
        
        // 计算得分
        this.calculateScore();
        
        // 更新平均配对时间
        const currentTime = Date.now();
        const matchTime = (currentTime - this.lastMatchTime) / 1000;
        this.averageTimePerMatch = ((this.averageTimePerMatch * (this.matchedPairs - 1)) + matchTime) / this.matchedPairs;
        this.lastMatchTime = currentTime;
        
        // 检查是否获胜
        if (this.matchedPairs === this.totalPairs) {
            this.winGame();
        }
        
        this.showMessage(`配对成功！连击 ${this.combo}`, 'success');
    }
    
    lockCardAsMatched(cardElement) {
        // 移除所有事件监听器
        const newCardElement = cardElement.cloneNode(true);
        cardElement.parentNode.replaceChild(newCardElement, cardElement);
        
        // 添加匹配样式
        newCardElement.classList.add('matched', 'flipped');
        
        // 强制设置内联样式
        newCardElement.style.pointerEvents = 'none';
        newCardElement.style.cursor = 'default';
        
        const cardInner = newCardElement.querySelector('.card-inner');
        if (cardInner) {
            cardInner.style.transform = 'rotateY(180deg)';
            cardInner.style.transition = 'none'; // 禁用所有过渡动画
        }
        
        const cardFront = newCardElement.querySelector('.card-front');
        if (cardFront) {
            cardFront.style.transform = 'rotateY(0deg)';
            cardFront.style.backfaceVisibility = 'visible';
        }
        
        // 添加匹配发光效果
        setTimeout(() => {
            newCardElement.style.filter = 'drop-shadow(0 0 10px #27ae60)';
            newCardElement.style.border = '3px solid #27ae60';
        }, 100);
    }
    
    handleMismatch(card1, card2) {
        // 只有未匹配的卡片才会被翻回背面
        if (!card1.isMatched) {
            card1.isFlipped = false;
        }
        if (!card2.isMatched) {
            card2.isFlipped = false;
        }
        this.combo = 0;
        
        const cardEl1 = document.querySelector(`[data-card-id="${card1.id}"]`);
        const cardEl2 = document.querySelector(`[data-card-id="${card2.id}"]`);
        
        // 只移除未匹配卡片的flipped类
        if (!card1.isMatched) {
            cardEl1.classList.remove('flipped');
        }
        if (!card2.isMatched) {
            cardEl2.classList.remove('flipped');
        }
        
        this.showMessage('配对失败！', 'error');
    }
    
    calculateScore() {
        const basePoints = 100;
        const timeBonus = Math.max(0, 50 - Math.floor((Date.now() - this.startTime) / 1000));
        const comboBonus = this.combo > 1 ? (this.combo - 1) * 25 : 0;
        
        const matchScore = basePoints + timeBonus + comboBonus;
        this.score += matchScore;
        
        this.elements.baseScore.textContent = `+${basePoints}分`;
        this.elements.timeBonus.textContent = timeBonus > 0 ? `+${timeBonus}分` : '0分';
        this.elements.comboBonus.textContent = comboBonus > 0 ? `+${comboBonus}分` : '0分';
    }
    
    giveHint() {
        if (!this.isGameActive || this.isPaused || this.hintUsed >= this.maxHints || this.flippedCards.length > 0) {
            return;
        }
        
        // 找到一对未匹配的卡片
        const unmatched = this.cards.filter(card => !card.isMatched);
        const pairs = {};
        
        unmatched.forEach(card => {
            if (!pairs[card.pairId]) {
                pairs[card.pairId] = [];
            }
            pairs[card.pairId].push(card);
        });
        
        // 找到第一对完整的卡片
        for (let pairId in pairs) {
            if (pairs[pairId].length === 2) {
                const [card1, card2] = pairs[pairId];
                const cardEl1 = document.querySelector(`[data-card-id="${card1.id}"]`);
                const cardEl2 = document.querySelector(`[data-card-id="${card2.id}"]`);
                
                cardEl1.classList.add('hint');
                cardEl2.classList.add('hint');
                
                setTimeout(() => {
                    cardEl1.classList.remove('hint');
                    cardEl2.classList.remove('hint');
                }, 2000);
                
                this.hintUsed++;
                this.score = Math.max(0, this.score - 50); // 使用提示扣分
                this.elements.hintText.textContent = `提示剩余: ${this.maxHints - this.hintUsed}`;
                this.showMessage(`提示已使用 (剩余${this.maxHints - this.hintUsed}次)`, 'warning');
                break;
            }
        }
        
        this.updateDisplay();
    }
    
    togglePause() {
        if (!this.isGameActive) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.stopTimer();
            this.elements.pauseBtn.textContent = '继续';
            this.elements.gameStatus.textContent = '游戏暂停';
            this.showMessage('游戏已暂停', 'info');
        } else {
            this.startTimer();
            this.elements.pauseBtn.textContent = '暂停';
            this.elements.gameStatus.textContent = '游戏进行中';
            this.showMessage('游戏继续', 'info');
        }
    }
    
    restartGame() {
        this.isGameActive = false;
        this.isPaused = false;
        this.stopTimer();
        this.elements.gameOverlay.style.display = 'flex';
        this.elements.gameStats.style.display = 'none';
        this.elements.difficultySelector.style.display = 'block';
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'none';
        this.elements.pauseBtn.textContent = '暂停';
        this.elements.gameStatus.textContent = '等待开始';
        this.elements.hintText.textContent = '点击提示按钮获得帮助';
        this.updateDisplay();
    }
    
    winGame() {
        this.isGameActive = false;
        this.stopTimer();
        
        const finalTime = this.formatTime(Date.now() - this.startTime);
        const completionBonus = Math.max(0, 1000 - Math.floor((Date.now() - this.startTime) / 1000));
        this.score += completionBonus;
        
        this.elements.completionBonus.textContent = completionBonus > 0 ? `+${completionBonus}分` : '0分';
        
        // 更新统计信息
        this.elements.finalTime.textContent = finalTime;
        this.elements.finalScore.textContent = this.score;
        this.elements.flipCount.textContent = this.moves;
        this.elements.matchCount.textContent = this.matchedPairs;
        
        // 保存最佳记录
        const bestTimeKey = `memory-best-${this.currentDifficulty}`;
        const currentBest = localStorage.getItem(bestTimeKey);
        const currentTimeMs = Date.now() - this.startTime;
        
        if (!currentBest || currentTimeMs < parseInt(currentBest)) {
            localStorage.setItem(bestTimeKey, currentTimeMs.toString());
            this.showMessage('新记录！', 'success');
        }
        
        // 显示胜利界面
        this.elements.gameStats.style.display = 'grid';
        this.elements.difficultySelector.style.display = 'none';
        this.elements.gameOverlay.style.display = 'flex';
        this.elements.gameStatus.textContent = '游戏完成';
        
        this.elements.overlayTitle.textContent = '恭喜完成！';
        this.elements.overlayText.textContent = `你用时${finalTime}，得分${this.score}分完成了记忆卡片！`;
        
        // 添加胜利动画
        document.querySelectorAll('.memory-card.matched').forEach(card => {
            card.classList.add('victory-animation');
        });
        
        this.showMessage('恭喜！记忆卡片完成！', 'success');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (this.isGameActive && !this.isPaused) {
                const elapsed = Date.now() - this.startTime;
                const time = this.formatTime(elapsed);
                this.elements.timer.textContent = time;
                this.elements.currentTime.textContent = time;
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        // 更新基本信息
        this.elements.score.textContent = this.score;
        this.elements.currentScore.textContent = this.score;
        this.elements.currentFlips.textContent = this.moves;
        this.elements.currentMatches.textContent = this.matchedPairs;
        this.elements.remainingPairs.textContent = this.totalPairs - this.matchedPairs;
        this.elements.currentDifficulty.textContent = this.difficulties[this.currentDifficulty].name;
        
        // 更新准确率
        const accuracy = this.moves > 0 ? Math.round((this.matchedPairs * 2 / this.moves) * 100) : 0;
        this.elements.accuracy.textContent = `${accuracy}%`;
        
        // 更新进度
        const progress = this.totalPairs > 0 ? (this.matchedPairs / this.totalPairs) * 100 : 0;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${Math.round(progress)}%`;
        
        // 更新进度详情
        this.elements.matchedPairs.textContent = this.matchedPairs;
        this.elements.totalPairs.textContent = this.totalPairs;
        this.elements.comboCount.textContent = this.combo;
        this.elements.maxCombo.textContent = this.maxCombo;
        
        // 更新统计信息
        this.elements.totalFlips.textContent = this.moves;
        this.elements.successRate.textContent = `${accuracy}%`;
        this.elements.avgTime.textContent = `${this.averageTimePerMatch.toFixed(1)}s`;
        
        // 更新最佳记录
        const bestTimeKey = `memory-best-${this.currentDifficulty}`;
        const bestTime = localStorage.getItem(bestTimeKey);
        this.elements.bestTime.textContent = bestTime ? this.formatTime(parseInt(bestTime)) : '--:--';
        
        // 更新按钮状态
        this.elements.hintBtn.disabled = this.hintUsed >= this.maxHints || !this.isGameActive;
        this.elements.shuffleBtn.disabled = !this.isGameActive || this.matchedPairs > 0;
        this.elements.pauseBtn.disabled = !this.isGameActive;
        
        // 双重保险：强制确保所有匹配的卡片保持翻开状态
        this.cards.forEach(card => {
            if (card.isMatched) {
                const cardEl = document.querySelector(`[data-card-id="${card.id}"]`);
                if (cardEl) {
                    cardEl.classList.add('matched', 'flipped');
                    cardEl.style.pointerEvents = 'none';
                    const cardInner = cardEl.querySelector('.card-inner');
                    if (cardInner) {
                        cardInner.style.transform = 'rotateY(180deg)';
                    }
                }
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.isGameActive) return;
        
        switch (e.key) {
            case 'h':
            case 'H':
                e.preventDefault();
                this.giveHint();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.togglePause();
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.restartGame();
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // 添加样式
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            fontFamily: 'var(--pixel-font)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '2px solid var(--border-color)'
        });
        
        // 根据类型设置背景色
        const bgColors = {
            info: 'var(--accent-color)',
            success: 'var(--success-color)',
            error: 'var(--error-color)',
            warning: 'var(--warning-color)'
        };
        
        messageEl.style.background = bgColors[type] || bgColors.info;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 动画显示
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateX(0)';
        });
        
        // 3秒后自动隐藏
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
}); 