// 俄罗斯方块游戏 - 像素风格
class TetrisGame {
    constructor() {
        this.board = [];
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('tetrisHighScore')) || 0;
        this.level = 1;
        this.lines = 0;
        this.gameState = 'waiting'; // waiting, playing, paused, ended
        this.dropTime = 1000; // 毫秒
        this.lastDrop = 0;
        this.startTime = null;
        this.gameTime = 0;
        this.timeInterval = null;
        
        // 当前方块和下一个方块
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropCounter = 0;
        
        // 方块类型定义
        this.pieces = {
            I: {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 'I'
            },
            O: {
                shape: [
                    [0, 0, 0, 0],
                    [0, 1, 1, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0]
                ],
                color: 'O'
            },
            T: {
                shape: [
                    [0, 0, 0, 0],
                    [0, 1, 0, 0],
                    [1, 1, 1, 0],
                    [0, 0, 0, 0]
                ],
                color: 'T'
            },
            S: {
                shape: [
                    [0, 0, 0, 0],
                    [0, 1, 1, 0],
                    [1, 1, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 'S'
            },
            Z: {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0]
                ],
                color: 'Z'
            },
            J: {
                shape: [
                    [0, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 1, 1, 0],
                    [0, 0, 0, 0]
                ],
                color: 'J'
            },
            L: {
                shape: [
                    [0, 0, 0, 0],
                    [0, 0, 1, 0],
                    [1, 1, 1, 0],
                    [0, 0, 0, 0]
                ],
                color: 'L'
            }
        };
        
        this.pieceTypes = Object.keys(this.pieces);
        
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
            currentLines: document.getElementById('currentLines'),
            currentLevel: document.getElementById('currentLevel'),
            currentTime: document.getElementById('currentTime'),
            gameStatus: document.getElementById('gameStatus'),
            finalScore: document.getElementById('finalScore'),
            totalLines: document.getElementById('totalLines'),
            finalLevel: document.getElementById('finalLevel'),
            gameTime: document.getElementById('gameTime'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            gameBoard: document.getElementById('gameBoard'),
            gridContainer: document.getElementById('gridContainer'),
            activePieceContainer: document.getElementById('activePieceContainer'),
            nextPieceGrid: document.getElementById('nextPieceGrid'),
            // 迷你统计信息元素
            miniLevel: document.getElementById('miniLevel'),
            miniLines: document.getElementById('miniLines'),
            miniTime: document.getElementById('miniTime')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initBoard();
        this.createGrid();
        this.createNextPieceGrid();
        this.updateUI();
    }
    
    setupEventListeners() {
        // 按钮事件
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            if (this.gameState === 'playing') {
                this.drawBoard();
            }
        });
        
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
                } else if (this.gameState === 'ended') {
                    this.restartGame();
                } else if (this.gameState === 'paused') {
                    this.togglePause();
                }
            }
            return;
        }
        
        // 游戏控制键
        switch(e.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.rotatePiece();
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.dropPiece();
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.movePiece(1, 0);
                break;
            case 'Space':
                this.togglePause();
                break;
        }
    }
    
    initBoard() {
        this.board = [];
        for (let y = 0; y < this.boardHeight; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                this.board[y][x] = 0;
            }
        }
    }
    
    createGrid() {
        this.elements.gridContainer.innerHTML = '';
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.elements.gridContainer.appendChild(cell);
            }
        }
    }
    
    createNextPieceGrid() {
        if (!this.elements.nextPieceGrid) {
            console.error('nextPieceGrid元素不存在!');
            return;
        }
        
        this.elements.nextPieceGrid.innerHTML = '';
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'next-piece-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.elements.nextPieceGrid.appendChild(cell);
            }
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.elements.overlay.style.display = 'none';
        
        // 生成第一个和下一个方块
        this.nextPiece = this.generatePiece();
        this.spawnPiece();
        
        this.timeInterval = setInterval(() => this.updateTime(), 100);
        this.gameLoop();
        this.updateUI();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    resetGame() {
        // 停止游戏循环和计时
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        
        // 重置游戏状态
        this.gameState = 'waiting';
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameTime = 0;
        this.startTime = null;
        this.dropTime = 1000;
        this.lastDrop = 0;
        this.currentPiece = null;
        this.nextPiece = null;
        
        // 重置游戏板
        this.initBoard();
        this.clearBoard();
        
        // 生成下一个方块用于预览
        this.nextPiece = this.generatePiece();
        
        // 显示开始界面
        this.elements.overlay.style.display = 'flex';
        this.elements.overlayTitle.textContent = 'TETRIS GAME';
        this.elements.overlayText.textContent = '使用 WASD 或 方向键 控制方块';
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'none';
        this.elements.gameStats.style.display = 'none';
        
        this.updateUI();
        this.updateNextPiece();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.elements.pauseBtn.textContent = '继续';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.elements.pauseBtn.textContent = '暂停';
            this.gameLoop();
        }
        this.updateUI();
    }
    
    generatePiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        return {
            type: type,
            shape: this.copyMatrix(this.pieces[type].shape),
            x: Math.floor(this.boardWidth / 2) - 2,
            y: 0,
            color: this.pieces[type].color
        };
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        
        // 检查游戏是否结束
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
            return;
        }
        
        this.updateNextPiece();
        this.drawBoard();
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.drawBoard();
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.copyMatrix(this.currentPiece.shape);
        
        // 90度顺时针旋转
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                rotated[x][3 - y] = this.currentPiece.shape[y][x];
            }
        }
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        // 检查旋转后是否发生碰撞
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            // 尝试墙踢（Wall Kick）
            const kicks = [[-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]];
            let kicked = false;
            
            for (const [dx, dy] of kicks) {
                if (!this.checkCollision(this.currentPiece, dx, dy)) {
                    this.currentPiece.x += dx;
                    this.currentPiece.y += dy;
                    kicked = true;
                    break;
                }
            }
            
            if (!kicked) {
                // 无法旋转，恢复原来的形状
                this.currentPiece.shape = originalShape;
                return;
            }
        }
        
        this.drawBoard();
    }
    
    dropPiece() {
        if (!this.movePiece(0, 1)) {
            this.lockPiece();
        }
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // 将当前方块固定到游戏板上
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // 检查并清除完整行
        this.clearLines();
        
        // 生成新方块
        this.spawnPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        const linesToClear = [];
        
        // 检查每一行是否完整
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            // 播放清除动画
            this.animateLineClearing(linesToClear);
            
            // 延迟执行清除逻辑
            setTimeout(() => {
                // 清除完整行
                linesToClear.forEach(lineY => {
                    this.board.splice(lineY, 1);
                    this.board.unshift(new Array(this.boardWidth).fill(0));
                });
                
                linesCleared = linesToClear.length;
                this.lines += linesCleared;
                
                // 计算分数
                this.calculateScore(linesCleared);
                
                // 更新等级
                this.updateLevel();
                
                // 重新绘制游戏板
                this.drawBoard();
                this.updateUI();
            }, 500);
        }
    }
    
    animateLineClearing(lines) {
        lines.forEach(lineY => {
            for (let x = 0; x < this.boardWidth; x++) {
                const block = this.elements.activePieceContainer.querySelector(
                    `[data-x="${x}"][data-y="${lineY}"]`
                );
                if (block) {
                    block.classList.add('clearing');
                }
            }
        });
    }
    
    calculateScore(linesCleared) {
        const baseScores = [0, 100, 300, 500, 800];
        const lineScore = baseScores[linesCleared] || 800;
        this.score += lineScore * this.level;
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropTime = Math.max(50, 1000 - (this.level - 1) * 100);
        }
    }
    
    checkCollision(piece, dx, dy) {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    // 检查边界
                    if (newX < 0 || newX >= this.boardWidth || newY >= this.boardHeight) {
                        return true;
                    }
                    
                    // 检查与其他方块的碰撞
                    if (newY >= 0 && this.board[newY][newX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        const now = Date.now();
        if (now - this.lastDrop > this.dropTime) {
            this.dropPiece();
            this.lastDrop = now;
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.gameState = 'ended';
        
        // 停止计时
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.highScore.toString());
        }
        
        // 显示游戏结束界面
        this.elements.overlay.style.display = 'flex';
        this.elements.overlayTitle.textContent = 'GAME OVER';
        this.elements.overlayTitle.style.color = '#e91e63';
        this.elements.overlayText.textContent = this.score > this.highScore - 1000 ? '不错的分数！' : '再试一次？';
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.gameStats.style.display = 'block';
        
        // 更新统计信息
        this.updateGameStats();
        this.updateUI();
    }
    
    updateGameStats() {
        this.elements.finalScore.textContent = this.score;
        this.elements.totalLines.textContent = this.lines;
        this.elements.finalLevel.textContent = this.level;
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
        this.elements.highScore.textContent = this.highScore;
        this.elements.currentScore.textContent = this.score;
        this.elements.currentLines.textContent = this.lines;
        this.elements.currentLevel.textContent = this.level;
        this.elements.currentTime.textContent = this.formatTime(this.gameTime);
        
        // 更新迷你统计信息
        if (this.elements.miniLevel) this.elements.miniLevel.textContent = this.level;
        if (this.elements.miniLines) this.elements.miniLines.textContent = this.lines;
        if (this.elements.miniTime) this.elements.miniTime.textContent = this.formatTime(this.gameTime);
        
        // 更新游戏状态
        const statusMap = {
            'waiting': '等待开始',
            'playing': '游戏中',
            'paused': '已暂停',
            'ended': '游戏结束'
        };
        this.elements.gameStatus.textContent = statusMap[this.gameState];
        
        // 更新状态指示器
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator status-${this.gameState}`;
        }
        
        // 更新暂停按钮
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.textContent = this.gameState === 'paused' ? '继续' : '暂停';
            this.elements.pauseBtn.disabled = this.gameState !== 'playing' && this.gameState !== 'paused';
        }
    }
    
    drawBoard() {
        this.clearBoard();
        
        // 绘制已固定的方块
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] !== 0) {
                    this.createBlock(x, y, this.board[y][x], true);
                }
            }
        }
        
        // 绘制当前方块
        if (this.currentPiece) {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const boardX = this.currentPiece.x + x;
                        const boardY = this.currentPiece.y + y;
                        if (boardX >= 0 && boardX < this.boardWidth && boardY >= 0) {
                            this.createBlock(boardX, boardY, this.currentPiece.color, false);
                        }
                    }
                }
            }
        }
    }
    
    clearBoard() {
        this.elements.activePieceContainer.innerHTML = '';
    }
    
    createBlock(x, y, color, isFixed) {
        const block = document.createElement('div');
        block.className = `tetris-block ${color} ${isFixed ? 'fixed' : ''}`;
        
        // 使用百分比定位确保方块与网格完美对齐
        const leftPercent = (x / this.boardWidth) * 100;
        const topPercent = (y / this.boardHeight) * 100;
        
        block.style.left = `${leftPercent}%`;
        block.style.top = `${topPercent}%`;
        block.style.width = `${100 / this.boardWidth}%`;
        block.style.height = `${100 / this.boardHeight}%`;
        
        block.dataset.x = x;
        block.dataset.y = y;
        this.elements.activePieceContainer.appendChild(block);
    }
    
    updateNextPiece() {
        // 清除之前的预览
        const cells = this.elements.nextPieceGrid.querySelectorAll('.next-piece-cell');
        cells.forEach(cell => {
            cell.className = 'next-piece-cell';
            // 强制清除内联样式
            cell.style.backgroundColor = '';
            cell.style.borderColor = '';
        });
        
        if (!this.nextPiece) {
            return;
        }
        
        // 定义颜色映射
        const colorMap = {
            'I': { bg: '#00ffff', border: '#008b8b' },
            'O': { bg: '#ffff00', border: '#999900' },
            'T': { bg: '#9370db', border: '#4b0082' },
            'S': { bg: '#00ff7f', border: '#008b00' },
            'Z': { bg: '#ff6347', border: '#8b0000' },
            'J': { bg: '#1e90ff', border: '#000080' },
            'L': { bg: '#ffa500', border: '#ff6347' }
        };
        
        // 绘制下一个方块
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (this.nextPiece.shape[y][x]) {
                    const cell = this.elements.nextPieceGrid.querySelector(
                        `[data-x="${x}"][data-y="${y}"]`
                    );
                    if (cell) {
                        const newClassName = `next-piece-cell tetris-block ${this.nextPiece.color}`;
                        cell.className = newClassName;
                        
                        // 强制应用内联样式作为备用方案
                        const colors = colorMap[this.nextPiece.color];
                        if (colors) {
                            cell.style.backgroundColor = colors.bg;
                            cell.style.borderColor = colors.border;
                            cell.style.borderWidth = '2px';
                            cell.style.borderStyle = 'solid';
                        }
                    } else {
                        console.error(`找不到位置 (${x}, ${y}) 的单元格`);
                    }
                }
            }
        }
    }
    
    copyMatrix(matrix) {
        return matrix.map(row => [...row]);
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
    const game = new TetrisGame();
    
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