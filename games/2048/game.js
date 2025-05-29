// 2048游戏 - 像素风格
class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048BestScore')) || 0;
        this.gameState = 'waiting'; // waiting, playing, won, ended
        this.moveCount = 0;
        this.startTime = null;
        this.gameTime = 0;
        this.timeInterval = null;
        this.canUndo = false;
        this.previousState = null;
        this.maxTileValue = 2;
        
        // DOM元素
        this.elements = {
            overlay: document.getElementById('gameOverlay'),
            overlayTitle: document.getElementById('overlayTitle'),
            overlayText: document.getElementById('overlayText'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            gameStats: document.getElementById('gameStats'),
            score: document.getElementById('score'),
            highScore: document.getElementById('highScore'),
            currentScore: document.getElementById('currentScore'),
            currentMaxTile: document.getElementById('currentMaxTile'),
            currentMoves: document.getElementById('currentMoves'),
            currentTime: document.getElementById('currentTime'),
            gameStatus: document.getElementById('gameStatus'),
            finalScore: document.getElementById('finalScore'),
            maxTile: document.getElementById('maxTile'),
            moveCount: document.getElementById('moveCount'),
            gameTime: document.getElementById('gameTime'),
            undoBtn: document.getElementById('undoBtn'),
            resetBtn: document.getElementById('resetBtn'),
            tilesContainer: document.getElementById('tilesContainer'),
            gameBoard: document.getElementById('gameBoard')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initGrid();
        this.updateUI();
        this.updateTargetProgress();
    }
    
    setupEventListeners() {
        // 按钮事件
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.undoBtn.addEventListener('click', () => this.undoMove());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyPress(e) {
        if (this.gameState !== 'playing') {
            if (e.code === 'Space' || e.key === 'Enter') {
                if (this.gameState === 'waiting') {
                    this.startGame();
                } else if (this.gameState === 'ended' || this.gameState === 'won') {
                    this.restartGame();
                }
            }
            return;
        }
        
        // 游戏控制键
        let moved = false;
        switch(e.code) {
            case 'ArrowUp':
            case 'KeyW':
                moved = this.move('up');
                break;
            case 'ArrowDown':
            case 'KeyS':
                moved = this.move('down');
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moved = this.move('left');
                break;
            case 'ArrowRight':
            case 'KeyD':
                moved = this.move('right');
                break;
            case 'KeyZ':
                if (e.ctrlKey || e.metaKey) {
                    this.undoMove();
                }
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.moveCount++;
            this.updateUI();
            this.updateTargetProgress();
            this.checkGameState();
        }
    }
    
    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0;
            }
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.elements.overlay.style.display = 'none';
        
        // 添加初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.timeInterval = setInterval(() => this.updateTime(), 100);
        this.updateUI();
        this.renderGrid();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    resetGame() {
        // 停止计时
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        
        // 重置游戏状态
        this.gameState = 'waiting';
        this.score = 0;
        this.moveCount = 0;
        this.gameTime = 0;
        this.startTime = null;
        this.canUndo = false;
        this.previousState = null;
        this.maxTileValue = 2;
        
        // 重置网格
        this.initGrid();
        
        // 清空方块显示
        this.elements.tilesContainer.innerHTML = '';
        
        // 显示开始界面
        this.elements.overlay.style.display = 'flex';
        this.elements.overlayTitle.textContent = '2048 GAME';
        this.elements.overlayText.textContent = '使用 WASD 或 方向键 合并数字方块';
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'none';
        this.elements.gameStats.style.display = 'none';
        
        this.updateUI();
        this.updateTargetProgress();
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;
            
            // 创建并显示新方块
            this.createTile(randomCell.row, randomCell.col, value, true);
        }
    }
    
    createTile(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        tile.className = `tile ${isNew ? 'new' : ''}`;
        tile.setAttribute('data-row', row);
        tile.setAttribute('data-col', col);
        tile.setAttribute('data-value', value);
        tile.textContent = value;
        
        this.elements.tilesContainer.appendChild(tile);
        
        return tile;
    }
    
    renderGrid() {
        // 清空现有方块
        this.elements.tilesContainer.innerHTML = '';
        
        // 重新创建所有方块
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTile(i, j, this.grid[i][j]);
                }
            }
        }
        
        // 更新最大方块值
        this.updateMaxTileValue();
    }
    
    updateMaxTileValue() {
        let max = 2;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] > max) {
                    max = this.grid[i][j];
                }
            }
        }
        this.maxTileValue = max;
    }
    
    move(direction) {
        // 保存当前状态用于撤销
        this.saveState();
        
        let moved = false;
        const newGrid = this.copyGrid(this.grid);
        
        if (direction === 'left') {
            moved = this.slideLeft(newGrid);
        } else if (direction === 'right') {
            moved = this.slideRight(newGrid);
        } else if (direction === 'up') {
            moved = this.slideUp(newGrid);
        } else if (direction === 'down') {
            moved = this.slideDown(newGrid);
        }
        
        if (moved) {
            this.grid = newGrid;
            this.renderGrid();
            this.canUndo = true;
        } else {
            this.previousState = null;
            this.canUndo = false;
        }
        
        return moved;
    }
    
    slideLeft(grid) {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const line = grid[row].filter(cell => cell !== 0);
            
            // 合并相同数字
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    this.score += line[i];
                    line.splice(i + 1, 1);
                }
            }
            
            // 填充空位
            while (line.length < this.gridSize) {
                line.push(0);
            }
            
            // 检查是否有变化
            for (let col = 0; col < this.gridSize; col++) {
                if (grid[row][col] !== line[col]) {
                    moved = true;
                }
                grid[row][col] = line[col];
            }
        }
        
        return moved;
    }
    
    slideRight(grid) {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const line = grid[row].filter(cell => cell !== 0);
            
            // 从右向左合并
            for (let i = line.length - 1; i > 0; i--) {
                if (line[i] === line[i - 1]) {
                    line[i] *= 2;
                    this.score += line[i];
                    line.splice(i - 1, 1);
                    i--;
                }
            }
            
            // 在左侧填充空位
            while (line.length < this.gridSize) {
                line.unshift(0);
            }
            
            // 检查是否有变化
            for (let col = 0; col < this.gridSize; col++) {
                if (grid[row][col] !== line[col]) {
                    moved = true;
                }
                grid[row][col] = line[col];
            }
        }
        
        return moved;
    }
    
    slideUp(grid) {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const line = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (grid[row][col] !== 0) {
                    line.push(grid[row][col]);
                }
            }
            
            // 合并相同数字
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    this.score += line[i];
                    line.splice(i + 1, 1);
                }
            }
            
            // 填充空位
            while (line.length < this.gridSize) {
                line.push(0);
            }
            
            // 检查是否有变化
            for (let row = 0; row < this.gridSize; row++) {
                if (grid[row][col] !== line[row]) {
                    moved = true;
                }
                grid[row][col] = line[row];
            }
        }
        
        return moved;
    }
    
    slideDown(grid) {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const line = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (grid[row][col] !== 0) {
                    line.push(grid[row][col]);
                }
            }
            
            // 从下向上合并
            for (let i = line.length - 1; i > 0; i--) {
                if (line[i] === line[i - 1]) {
                    line[i] *= 2;
                    this.score += line[i];
                    line.splice(i - 1, 1);
                    i--;
                }
            }
            
            // 在上方填充空位
            while (line.length < this.gridSize) {
                line.unshift(0);
            }
            
            // 检查是否有变化
            for (let row = 0; row < this.gridSize; row++) {
                if (grid[row][col] !== line[row]) {
                    moved = true;
                }
                grid[row][col] = line[row];
            }
        }
        
        return moved;
    }
    
    saveState() {
        this.previousState = {
            grid: this.copyGrid(this.grid),
            score: this.score,
            moveCount: this.moveCount,
            maxTileValue: this.maxTileValue
        };
    }
    
    undoMove() {
        if (this.canUndo && this.previousState && this.gameState === 'playing') {
            this.grid = this.previousState.grid;
            this.score = this.previousState.score;
            this.moveCount = this.previousState.moveCount;
            this.maxTileValue = this.previousState.maxTileValue;
            
            this.renderGrid();
            this.updateUI();
            this.updateTargetProgress();
            
            this.canUndo = false;
            this.previousState = null;
        }
    }
    
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }
    
    checkGameState() {
        // 检查是否获胜
        if (this.maxTileValue >= 2048 && this.gameState !== 'won') {
            this.gameState = 'won';
            this.gameWon();
            return;
        }
        
        // 检查是否还能移动
        if (!this.canMove()) {
            this.gameState = 'ended';
            this.gameOver();
        }
    }
    
    canMove() {
        // 检查是否有空位
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    return true;
                }
            }
        }
        
        // 检查是否可以合并
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                
                // 检查右边
                if (j < this.gridSize - 1 && this.grid[i][j + 1] === current) {
                    return true;
                }
                
                // 检查下面
                if (i < this.gridSize - 1 && this.grid[i + 1][j] === current) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    gameWon() {
        // 停止计时
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        
        // 更新最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048BestScore', this.bestScore.toString());
        }
        
        // 显示获胜界面
        this.elements.overlay.style.display = 'flex';
        this.elements.overlayTitle.textContent = 'YOU WIN!';
        this.elements.overlayTitle.style.color = '#7b68ee';
        this.elements.overlayText.textContent = '恭喜达到2048！';
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.gameStats.style.display = 'block';
        
        // 更新统计信息
        this.updateGameStats();
        this.updateUI();
    }
    
    gameOver() {
        // 停止计时
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        
        // 更新最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048BestScore', this.bestScore.toString());
        }
        
        // 显示游戏结束界面
        this.elements.overlay.style.display = 'flex';
        this.elements.overlayTitle.textContent = 'GAME OVER';
        this.elements.overlayTitle.style.color = '#e91e63';
        this.elements.overlayText.textContent = this.score > this.bestScore - 100 ? '不错的分数！' : '再试一次？';
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.gameStats.style.display = 'block';
        
        // 更新统计信息
        this.updateGameStats();
        this.updateUI();
    }
    
    updateGameStats() {
        this.elements.finalScore.textContent = this.score;
        this.elements.maxTile.textContent = this.maxTileValue;
        this.elements.moveCount.textContent = this.moveCount;
        this.elements.gameTime.textContent = this.formatTime(this.gameTime);
    }
    
    updateTime() {
        if (this.gameState === 'playing' && this.startTime) {
            this.gameTime = Date.now() - this.startTime;
            this.updateUI();
        }
    }
    
    updateUI() {
        // 更新分数显示
        this.elements.score.textContent = this.score;
        this.elements.highScore.textContent = this.bestScore;
        this.elements.currentScore.textContent = this.score;
        this.elements.currentMaxTile.textContent = this.maxTileValue;
        this.elements.currentMoves.textContent = this.moveCount;
        this.elements.currentTime.textContent = this.formatTime(this.gameTime);
        
        // 更新游戏状态
        const statusMap = {
            'waiting': '等待开始',
            'playing': '游戏中',
            'won': '获胜！',
            'ended': '游戏结束'
        };
        this.elements.gameStatus.textContent = statusMap[this.gameState];
        
        // 更新状态指示器
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator status-${this.gameState}`;
        }
        
        // 更新撤销按钮状态
        if (this.elements.undoBtn) {
            this.elements.undoBtn.disabled = !this.canUndo || this.gameState !== 'playing';
        }
    }
    
    updateTargetProgress() {
        const targets = document.querySelectorAll('.target-tile');
        targets.forEach(target => {
            const value = parseInt(target.getAttribute('data-value'));
            if (this.maxTileValue >= value) {
                target.classList.add('achieved');
            } else {
                target.classList.remove('achieved');
            }
        });
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();
    
    // 添加状态指示器到游戏状态显示
    const gameStatusElement = document.getElementById('gameStatus');
    if (gameStatusElement) {
        const indicator = document.createElement('span');
        indicator.className = 'status-indicator status-waiting';
        gameStatusElement.parentNode.insertBefore(indicator, gameStatusElement);
    }
});

// 阻止页面滚动
window.addEventListener('keydown', function(e) {
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false); 