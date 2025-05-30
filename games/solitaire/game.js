// 纸牌接龙游戏逻辑
class SolitaireGame {
    constructor() {
        this.deck = [];
        this.tableau = [[], [], [], [], [], [], []]; // 7个游戏列
        this.foundations = [[], [], [], []]; // 4个目标堆
        this.stock = []; // 发牌堆
        this.waste = []; // 翻牌堆
        this.selectedCards = [];
        this.selectedPile = null;
        this.isGameActive = false;
        this.startTime = null;
        this.timer = null;
        this.score = 0;
        this.moves = 0;
        this.dealMode = 1; // 1张或3张翻牌
        this.dealCount = 0;
        this.moveHistory = [];
        
        // 花色和数值定义
        this.suits = ['♠', '♥', '♣', '♦'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitColors = { '♠': 'black', '♣': 'black', '♥': 'red', '♦': 'red' };
        
        this.initializeDOM();
        this.setupEventListeners();
    }
    
    initializeDOM() {
        this.elements = {
            gameArea: document.getElementById('gameArea'),
            gameOverlay: document.getElementById('gameOverlay'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            difficultySelector: document.getElementById('difficultySelector'),
            difficultyButtons: document.querySelectorAll('.difficulty-btn'),
            stockPile: document.getElementById('stockPile'),
            wastePile: document.getElementById('wastePile'),
            foundations: [
                document.getElementById('foundation0'),
                document.getElementById('foundation1'),
                document.getElementById('foundation2'),
                document.getElementById('foundation3')
            ],
            tableauColumns: [
                document.getElementById('tableau0'),
                document.getElementById('tableau1'),
                document.getElementById('tableau2'),
                document.getElementById('tableau3'),
                document.getElementById('tableau4'),
                document.getElementById('tableau5'),
                document.getElementById('tableau6')
            ],
            score: document.getElementById('score'),
            timer: document.getElementById('timer'),
            currentScore: document.getElementById('currentScore'),
            currentTime: document.getElementById('currentTime'),
            currentMoves: document.getElementById('currentMoves'),
            currentMode: document.getElementById('currentMode'),
            completedSuits: document.getElementById('completedSuits'),
            gameStatus: document.getElementById('gameStatus'),
            hintBtn: document.getElementById('hintBtn'),
            undoBtn: document.getElementById('undoBtn'),
            autoBtn: document.getElementById('autoBtn'),
            resetBtn: document.getElementById('resetBtn'),
            dealBtn: document.getElementById('dealBtn'),
            dealInfo: document.getElementById('dealInfo'),
            gameStats: document.getElementById('gameStats'),
            finalTime: document.getElementById('finalTime'),
            finalScore: document.getElementById('finalScore'),
            moveCount: document.getElementById('moveCount'),
            dealCountStat: document.getElementById('dealCount')
        };
        
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // 开始游戏按钮
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 发牌模式选择
        this.elements.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.difficultyButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.dealMode = parseInt(e.target.dataset.mode);
            });
        });
        
        // 控制按钮
        this.elements.hintBtn.addEventListener('click', () => this.giveHint());
        this.elements.undoBtn.addEventListener('click', () => this.undoMove());
        this.elements.autoBtn.addEventListener('click', () => this.autoComplete());
        this.elements.resetBtn.addEventListener('click', () => this.restartGame());
        this.elements.dealBtn.addEventListener('click', () => this.dealCards());
        
        // 发牌堆点击
        this.elements.stockPile.addEventListener('click', () => this.dealCards());
        
        // 废牌堆点击
        this.elements.wastePile.addEventListener('click', (e) => this.handleWasteClick(e));
        
        // 目标堆点击
        this.elements.foundations.forEach((foundation, index) => {
            foundation.addEventListener('click', (e) => this.handleFoundationClick(e, index));
        });
        
        // 游戏列点击
        this.elements.tableauColumns.forEach((column, index) => {
            column.addEventListener('click', (e) => this.handleTableauClick(e, index));
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    createDeck() {
        this.deck = [];
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                this.deck.push({
                    suit: suit,
                    value: value,
                    suitSymbol: this.suits[suit],
                    valueSymbol: this.values[value],
                    color: this.suitColors[this.suits[suit]],
                    faceUp: false,
                    id: `card-${suit}-${value}`
                });
            }
        }
        
        // 洗牌
        this.shuffleDeck();
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealInitialCards() {
        // 清空所有堆
        this.tableau = [[], [], [], [], [], [], []];
        this.foundations = [[], [], [], []];
        this.stock = [];
        this.waste = [];
        
        let cardIndex = 0;
        
        // 发牌到游戏列
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck[cardIndex++];
                card.faceUp = (row === col); // 最后一张翻开
                this.tableau[col].push(card);
            }
        }
        
        // 剩余牌放入发牌堆
        while (cardIndex < this.deck.length) {
            this.stock.push(this.deck[cardIndex++]);
        }
    }
    
    startGame() {
        this.createDeck();
        this.dealInitialCards();
        this.isGameActive = true;
        this.startTime = Date.now();
        this.score = 0;
        this.moves = 0;
        this.dealCount = 0;
        this.moveHistory = [];
        this.selectedCards = [];
        this.selectedPile = null;
        
        this.elements.gameOverlay.style.display = 'none';
        this.elements.gameStatus.textContent = '游戏进行中';
        this.elements.difficultySelector.style.display = 'none';
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        
        this.startTimer();
        this.renderGame();
        this.updateDisplay();
    }
    
    restartGame() {
        this.isGameActive = false;
        this.stopTimer();
        this.elements.gameOverlay.style.display = 'flex';
        this.elements.gameStats.style.display = 'none';
        this.elements.difficultySelector.style.display = 'block';
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'none';
        this.elements.gameStatus.textContent = '等待开始';
        this.clearSelection();
        this.updateDisplay();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (this.isGameActive) {
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
    
    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.color} ${card.faceUp ? 'face-up' : 'face-down'}`;
        cardEl.dataset.cardId = card.id;
        
        if (card.faceUp) {
            // 生成中间内容
            let centerContent = '';
            
            if (card.value === 0) {
                // A牌：显示一个大花色符号
                centerContent = `<div class="card-center-ace">${card.suitSymbol}</div>`;
            } else if (card.value >= 1 && card.value <= 9) {
                // 2-10牌：显示相应数量的小花色符号
                const suitCount = card.value + 1; // value 1 = 2牌
                centerContent = '<div class="card-center-pips">';
                for (let i = 0; i < Math.min(suitCount, 6); i++) {
                    centerContent += `<span class="pip">${card.suitSymbol}</span>`;
                }
                if (suitCount > 6) {
                    centerContent += '<span class="pip-more">...</span>';
                }
                centerContent += '</div>';
            } else {
                // J、Q、K：显示字母
                const faceCards = { 10: 'J', 11: 'Q', 12: 'K' };
                centerContent = `<div class="card-center-face">${faceCards[card.value]}</div>`;
            }
            
            cardEl.innerHTML = `
                <div class="card-content">
                    <div class="card-top">
                        <div class="card-value">${card.valueSymbol}</div>
                        <div class="card-suit">${card.suitSymbol}</div>
                    </div>
                    ${centerContent}
                    <div class="card-bottom">
                        <div class="card-value">${card.valueSymbol}</div>
                        <div class="card-suit">${card.suitSymbol}</div>
                    </div>
                </div>
            `;
            
            // 添加特殊牌面样式
            if (card.value === 0) cardEl.classList.add('ace');
            if (card.value === 9) cardEl.classList.add('ten');
            if (card.value === 10) cardEl.classList.add('jack');
            if (card.value === 11) cardEl.classList.add('queen');
            if (card.value === 12) cardEl.classList.add('king');
        }
        
        return cardEl;
    }
    
    renderGame() {
        // 清空所有容器
        this.elements.stockPile.innerHTML = '';
        this.elements.wastePile.innerHTML = '';
        this.elements.foundations.forEach(foundation => foundation.innerHTML = '');
        this.elements.tableauColumns.forEach(column => column.innerHTML = '');
        
        // 渲染发牌堆
        if (this.stock.length > 0) {
            const stockCard = this.createCardElement(this.stock[this.stock.length - 1]);
            stockCard.style.position = 'relative';
            this.elements.stockPile.appendChild(stockCard);
        } else {
            this.elements.stockPile.innerHTML = '<div class="card-placeholder">重新开始</div>';
        }
        
        // 渲染废牌堆
        if (this.waste.length > 0) {
            // 显示最多3张牌
            const visibleCards = this.waste.slice(-3);
            visibleCards.forEach((card, index) => {
                const cardEl = this.createCardElement(card);
                cardEl.style.position = 'absolute';
                cardEl.style.left = `${index * 15}px`;
                cardEl.style.zIndex = index + 1;
                this.elements.wastePile.appendChild(cardEl);
            });
        } else {
            this.elements.wastePile.innerHTML = '<div class="card-placeholder">翻牌</div>';
        }
        
        // 渲染目标堆
        this.elements.foundations.forEach((foundation, index) => {
            if (this.foundations[index].length > 0) {
                const topCard = this.foundations[index][this.foundations[index].length - 1];
                const cardEl = this.createCardElement(topCard);
                cardEl.style.position = 'relative';
                foundation.appendChild(cardEl);
            } else {
                foundation.innerHTML = `<div class="foundation-placeholder">${this.suits[index]}</div>`;
            }
        });
        
        // 渲染游戏列
        this.elements.tableauColumns.forEach((column, colIndex) => {
            if (this.tableau[colIndex].length > 0) {
                this.tableau[colIndex].forEach((card, cardIndex) => {
                    const cardEl = this.createCardElement(card);
                    cardEl.style.position = 'absolute';
                    cardEl.style.top = `${cardIndex * 25}px`;
                    cardEl.style.zIndex = cardIndex + 1;
                    column.appendChild(cardEl);
                });
            } else {
                column.classList.add('empty');
            }
        });
        
        this.updateDealInfo();
    }
    
    dealCards() {
        if (!this.isGameActive) return;
        
        if (this.stock.length === 0) {
            // 重新洗牌
            this.stock = [...this.waste].reverse();
            this.stock.forEach(card => card.faceUp = false);
            this.waste = [];
            this.dealCount++;
        } else {
            // 翻牌
            const cardsToFlip = Math.min(this.dealMode, this.stock.length);
            for (let i = 0; i < cardsToFlip; i++) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.waste.push(card);
            }
        }
        
        this.renderGame();
        this.updateDisplay();
    }
    
    handleWasteClick(e) {
        if (!this.isGameActive || this.waste.length === 0) return;
        
        const topCard = this.waste[this.waste.length - 1];
        this.selectCard([topCard], 'waste');
    }
    
    handleFoundationClick(e, foundationIndex) {
        if (!this.isGameActive) return;
        
        if (this.selectedCards.length > 0) {
            this.tryMoveToFoundation(foundationIndex);
        }
    }
    
    handleTableauClick(e, columnIndex) {
        if (!this.isGameActive) return;
        
        const clickedCard = e.target.closest('.card');
        
        if (this.selectedCards.length > 0) {
            // 尝试移动选中的牌
            this.tryMoveToTableau(columnIndex);
        } else if (clickedCard) {
            // 选择牌
            const cardId = clickedCard.dataset.cardId;
            const cardIndex = this.tableau[columnIndex].findIndex(card => card.id === cardId);
            
            if (cardIndex !== -1) {
                const card = this.tableau[columnIndex][cardIndex];
                if (card.faceUp) {
                    // 选择这张牌及其下面的所有牌
                    const cardsToSelect = this.tableau[columnIndex].slice(cardIndex);
                    if (this.canSelectCards(cardsToSelect)) {
                        this.selectCard(cardsToSelect, `tableau-${columnIndex}`);
                    }
                } else {
                    // 翻开这张牌
                    if (cardIndex === this.tableau[columnIndex].length - 1) {
                        this.flipCard(columnIndex, cardIndex);
                    }
                }
            }
        } else {
            // 点击空列
            if (this.selectedCards.length > 0) {
                this.tryMoveToTableau(columnIndex);
            }
        }
    }
    
    canSelectCards(cards) {
        if (cards.length === 1) return true;
        
        // 检查是否是有效的降序序列
        for (let i = 1; i < cards.length; i++) {
            const prevCard = cards[i - 1];
            const currentCard = cards[i];
            
            if (prevCard.value !== currentCard.value + 1 || 
                prevCard.color === currentCard.color) {
                return false;
            }
        }
        
        return true;
    }
    
    selectCard(cards, pileType) {
        this.clearSelection();
        this.selectedCards = cards;
        this.selectedPile = pileType;
        
        // 添加选中样式
        cards.forEach(card => {
            const cardEl = document.querySelector(`[data-card-id="${card.id}"]`);
            if (cardEl) cardEl.classList.add('selected');
        });
    }
    
    clearSelection() {
        document.querySelectorAll('.card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        this.selectedCards = [];
        this.selectedPile = null;
    }
    
    tryMoveToFoundation(foundationIndex) {
        if (this.selectedCards.length !== 1) {
            this.clearSelection();
            return;
        }
        
        const card = this.selectedCards[0];
        const foundation = this.foundations[foundationIndex];
        
        // 检查是否可以放置
        if (foundation.length === 0) {
            // 只能放A
            if (card.value === 0) {
                this.moveCardToFoundation(card, foundationIndex);
            } else {
                this.showInvalidMove();
            }
        } else {
            const topCard = foundation[foundation.length - 1];
            // 必须是同花色且值+1
            if (card.suit === topCard.suit && card.value === topCard.value + 1) {
                this.moveCardToFoundation(card, foundationIndex);
            } else {
                this.showInvalidMove();
            }
        }
    }
    
    tryMoveToTableau(columnIndex) {
        const targetColumn = this.tableau[columnIndex];
        
        if (targetColumn.length === 0) {
            // 空列只能放K
            if (this.selectedCards[0].value === 12) {
                this.moveCardsToTableau(columnIndex);
            } else {
                this.showInvalidMove();
            }
        } else {
            const topCard = targetColumn[targetColumn.length - 1];
            const firstSelectedCard = this.selectedCards[0];
            
            // 必须是不同颜色且值-1
            if (firstSelectedCard.color !== topCard.color && 
                firstSelectedCard.value === topCard.value - 1) {
                this.moveCardsToTableau(columnIndex);
            } else {
                this.showInvalidMove();
            }
        }
    }
    
    moveCardToFoundation(card, foundationIndex) {
        // 保存移动历史
        this.saveMove();
        
        // 从原位置移除
        this.removeCardFromPile(card);
        
        // 添加到目标堆
        this.foundations[foundationIndex].push(card);
        
        // 更新分数
        this.score += 10;
        this.moves++;
        
        // 检查是否翻开新牌
        this.checkFlipCard();
        
        this.clearSelection();
        this.renderGame();
        this.updateDisplay();
        this.checkWin();
    }
    
    moveCardsToTableau(columnIndex) {
        // 保存移动历史
        this.saveMove();
        
        // 从原位置移除
        const cards = [...this.selectedCards];
        cards.forEach(card => this.removeCardFromPile(card));
        
        // 添加到目标列
        this.tableau[columnIndex].push(...cards);
        
        this.moves++;
        
        // 检查是否翻开新牌
        this.checkFlipCard();
        
        this.clearSelection();
        this.renderGame();
        this.updateDisplay();
    }
    
    removeCardFromPile(card) {
        if (this.selectedPile === 'waste') {
            const index = this.waste.findIndex(c => c.id === card.id);
            if (index !== -1) this.waste.splice(index, 1);
        } else if (this.selectedPile.startsWith('tableau-')) {
            const columnIndex = parseInt(this.selectedPile.split('-')[1]);
            const index = this.tableau[columnIndex].findIndex(c => c.id === card.id);
            if (index !== -1) this.tableau[columnIndex].splice(index, 1);
        }
    }
    
    checkFlipCard() {
        // 检查游戏列是否需要翻开新牌
        this.tableau.forEach((column, index) => {
            if (column.length > 0) {
                const topCard = column[column.length - 1];
                if (!topCard.faceUp) {
                    topCard.faceUp = true;
                    this.score += 5; // 翻牌得分
                }
            }
        });
    }
    
    flipCard(columnIndex, cardIndex) {
        const card = this.tableau[columnIndex][cardIndex];
        card.faceUp = true;
        this.score += 5;
        this.renderGame();
        this.updateDisplay();
    }
    
    showInvalidMove() {
        this.selectedCards.forEach(card => {
            const cardEl = document.querySelector(`[data-card-id="${card.id}"]`);
            if (cardEl) {
                cardEl.classList.add('invalid-drop');
                setTimeout(() => cardEl.classList.remove('invalid-drop'), 500);
            }
        });
        this.clearSelection();
    }
    
    saveMove() {
        this.moveHistory.push({
            tableau: this.tableau.map(col => [...col]),
            foundations: this.foundations.map(pile => [...pile]),
            stock: [...this.stock],
            waste: [...this.waste],
            score: this.score,
            moves: this.moves
        });
    }
    
    undoMove() {
        if (!this.isGameActive || this.moveHistory.length === 0) return;
        
        const lastState = this.moveHistory.pop();
        this.tableau = lastState.tableau;
        this.foundations = lastState.foundations;
        this.stock = lastState.stock;
        this.waste = lastState.waste;
        this.score = lastState.score;
        this.moves = lastState.moves;
        
        this.clearSelection();
        this.renderGame();
        this.updateDisplay();
    }
    
    giveHint() {
        if (!this.isGameActive) return;
        
        // 简单提示：查找可以移动到目标堆的牌
        let hintFound = false;
        
        // 检查废牌堆
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (this.canMoveToFoundation(topCard, i)) {
                    this.showHint(`翻牌堆的${topCard.valueSymbol}${topCard.suitSymbol}可以移动到目标堆`);
                    hintFound = true;
                    break;
                }
            }
        }
        
        // 检查游戏列
        if (!hintFound) {
            for (let col = 0; col < 7; col++) {
                if (this.tableau[col].length > 0) {
                    const topCard = this.tableau[col][this.tableau[col].length - 1];
                    if (topCard.faceUp) {
                        for (let i = 0; i < 4; i++) {
                            if (this.canMoveToFoundation(topCard, i)) {
                                this.showHint(`第${col + 1}列的${topCard.valueSymbol}${topCard.suitSymbol}可以移动到目标堆`);
                                hintFound = true;
                                break;
                            }
                        }
                        if (hintFound) break;
                    }
                }
            }
        }
        
        if (!hintFound) {
            this.showHint('没有找到明显的移动提示，尝试翻牌或移动其他牌');
        }
    }
    
    canMoveToFoundation(card, foundationIndex) {
        const foundation = this.foundations[foundationIndex];
        
        if (foundation.length === 0) {
            return card.value === 0; // 只能放A
        } else {
            const topCard = foundation[foundation.length - 1];
            return card.suit === topCard.suit && card.value === topCard.value + 1;
        }
    }
    
    showHint(message) {
        this.showMessage(message, 'info');
    }
    
    autoComplete() {
        if (!this.isGameActive) return;
        
        // 简单的自动完成：将所有可能的牌移动到目标堆
        let movedCard = false;
        
        do {
            movedCard = false;
            
            // 检查废牌堆
            if (this.waste.length > 0) {
                const topCard = this.waste[this.waste.length - 1];
                for (let i = 0; i < 4; i++) {
                    if (this.canMoveToFoundation(topCard, i)) {
                        this.selectCard([topCard], 'waste');
                        this.moveCardToFoundation(topCard, i);
                        movedCard = true;
                        break;
                    }
                }
            }
            
            // 检查游戏列
            if (!movedCard) {
                for (let col = 0; col < 7 && !movedCard; col++) {
                    if (this.tableau[col].length > 0) {
                        const topCard = this.tableau[col][this.tableau[col].length - 1];
                        if (topCard.faceUp) {
                            for (let i = 0; i < 4; i++) {
                                if (this.canMoveToFoundation(topCard, i)) {
                                    this.selectCard([topCard], `tableau-${col}`);
                                    this.moveCardToFoundation(topCard, i);
                                    movedCard = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        } while (movedCard);
        
        this.clearSelection();
    }
    
    checkWin() {
        const totalCards = this.foundations.reduce((sum, pile) => sum + pile.length, 0);
        if (totalCards === 52) {
            this.winGame();
        }
    }
    
    winGame() {
        this.isGameActive = false;
        this.stopTimer();
        
        const finalTime = this.formatTime(Date.now() - this.startTime);
        const timeBonus = Math.max(0, 10000 - Math.floor((Date.now() - this.startTime) / 1000) * 2);
        this.score += timeBonus;
        
        // 更新统计信息
        this.elements.finalTime.textContent = finalTime;
        this.elements.finalScore.textContent = this.score;
        this.elements.moveCount.textContent = this.moves;
        this.elements.dealCountStat.textContent = this.dealCount;
        
        // 显示胜利界面
        this.elements.gameStats.style.display = 'grid';
        this.elements.difficultySelector.style.display = 'none';
        this.elements.gameOverlay.style.display = 'flex';
        this.elements.gameStatus.textContent = '游戏完成';
        
        // 显示胜利消息
        document.querySelector('.overlay-title').textContent = '恭喜完成！';
        document.querySelector('.overlay-text').textContent = `你用时${finalTime}，得分${this.score}分完成了纸牌接龙！`;
        
        this.showMessage('恭喜！纸牌接龙完成！', 'success');
        
        // 播放胜利动画
        this.elements.foundations.forEach(foundation => {
            foundation.classList.add('complete');
        });
    }
    
    updateDisplay() {
        // 更新分数和时间
        this.elements.score.textContent = this.score;
        this.elements.currentScore.textContent = this.score;
        this.elements.currentMoves.textContent = this.moves;
        this.elements.currentMode.textContent = this.dealMode === 1 ? '单张' : '三张';
        
        // 更新完成状态
        const completedSuits = this.foundations.filter(pile => pile.length === 13).length;
        this.elements.completedSuits.textContent = `${completedSuits}/4`;
        
        // 更新进度条
        this.updateProgress();
    }
    
    updateProgress() {
        const suitNames = ['spades', 'hearts', 'clubs', 'diamonds'];
        let totalProgress = 0;
        
        this.foundations.forEach((pile, index) => {
            const progress = (pile.length / 13) * 100;
            const progressFill = document.getElementById(`${suitNames[index]}Progress`);
            const progressText = document.getElementById(`${suitNames[index]}Text`);
            
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${pile.length}/13`;
            
            totalProgress += pile.length;
        });
        
        const overallProgress = (totalProgress / 52) * 100;
        const overallFill = document.getElementById('overallProgress');
        const overallText = document.getElementById('overallText');
        
        if (overallFill) overallFill.style.width = `${overallProgress}%`;
        if (overallText) overallText.textContent = `游戏进度: ${Math.round(overallProgress)}%`;
    }
    
    updateDealInfo() {
        this.elements.dealInfo.textContent = `牌堆: ${this.stock.length}张`;
    }
    
    handleKeyPress(e) {
        if (!this.isGameActive) return;
        
        switch (e.key) {
            case 'd':
            case 'D':
                e.preventDefault();
                this.dealCards();
                break;
            case 'h':
            case 'H':
                e.preventDefault();
                this.giveHint();
                break;
            case 'u':
            case 'U':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.undoMove();
                }
                break;
            case 'a':
            case 'A':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.autoComplete();
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.clearSelection();
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
    new SolitaireGame();
}); 