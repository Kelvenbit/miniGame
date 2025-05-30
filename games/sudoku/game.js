// 数独游戏逻辑
class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.initialBoard = [];
        this.selectedCell = null;
        this.selectedNumber = null;
        this.isGameActive = false;
        this.startTime = null;
        this.timer = null;
        this.difficulty = 'easy';
        this.errorCount = 0;
        this.hintCount = 0;
        this.maxHints = 3;
        this.moveHistory = [];
        
        // 难度设置
        this.difficultySettings = {
            easy: { cellsToRemove: 40 },
            medium: { cellsToRemove: 50 },
            hard: { cellsToRemove: 60 },
            expert: { cellsToRemove: 70 }
        };
        
        this.initializeDOM();
        this.setupEventListeners();
    }
    
    initializeDOM() {
        this.elements = {
            sudokuBoard: document.getElementById('sudokuBoard'),
            gameOverlay: document.getElementById('gameOverlay'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            difficultySelector: document.getElementById('difficultySelector'),
            difficultyButtons: document.querySelectorAll('.difficulty-btn'),
            numberButtons: document.querySelectorAll('.number-btn'),
            clearBtn: document.getElementById('clearBtn'),
            hintBtn: document.getElementById('hintBtn'),
            undoBtn: document.getElementById('undoBtn'),
            checkBtn: document.getElementById('checkBtn'),
            timer: document.getElementById('timer'),
            currentTime: document.getElementById('currentTime'),
            currentDifficulty: document.getElementById('currentDifficulty'),
            remainingCells: document.getElementById('remainingCells'),
            currentErrors: document.getElementById('currentErrors'),
            hintsLeft: document.getElementById('hintsLeft'),
            gameStatus: document.getElementById('gameStatus'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            gameStats: document.getElementById('gameStats'),
            finalTime: document.getElementById('finalTime'),
            finalDifficulty: document.getElementById('finalDifficulty'),
            errorCount: document.getElementById('errorCount'),
            hintCountStat: document.getElementById('hintCount')
        };
        
        this.createBoard();
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
                this.difficulty = e.target.dataset.difficulty;
            });
        });
        
        // 数字按钮
        this.elements.numberButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectNumber(parseInt(e.target.dataset.number));
            });
        });
        
        // 控制按钮
        this.elements.clearBtn.addEventListener('click', () => this.clearCell());
        this.elements.hintBtn.addEventListener('click', () => this.giveHint());
        this.elements.undoBtn.addEventListener('click', () => this.undoMove());
        this.elements.checkBtn.addEventListener('click', () => this.checkSolution());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    createBoard() {
        this.elements.sudokuBoard.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.selectCell(row, col));
                this.elements.sudokuBoard.appendChild(cell);
            }
        }
    }
    
    generateSudoku() {
        // 生成完整的数独解决方案
        this.solution = this.createEmptyBoard();
        this.solveSudoku(this.solution);
        
        // 创建游戏棋盘，移除一些数字
        this.board = this.deepCopy(this.solution);
        this.removeNumbers();
        this.initialBoard = this.deepCopy(this.board);
    }
    
    createEmptyBoard() {
        return Array(9).fill().map(() => Array(9).fill(0));
    }
    
    deepCopy(board) {
        return board.map(row => [...row]);
    }
    
    solveSudoku(board) {
        const emptyCell = this.findEmptyCell(board);
        if (!emptyCell) return true;
        
        const [row, col] = emptyCell;
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (let num of numbers) {
            if (this.isValidMove(board, row, col, num)) {
                board[row][col] = num;
                
                if (this.solveSudoku(board)) {
                    return true;
                }
                
                board[row][col] = 0;
            }
        }
        
        return false;
    }
    
    findEmptyCell(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    isValidMove(board, row, col, num) {
        // 检查行
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false;
        }
        
        // 检查列
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }
        
        // 检查3x3宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }
        
        return true;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    removeNumbers() {
        const cellsToRemove = this.difficultySettings[this.difficulty].cellsToRemove;
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.board[row][col] !== 0) {
                const backup = this.board[row][col];
                this.board[row][col] = 0;
                
                // 确保仍然只有一个解
                if (this.hasUniqueSolution()) {
                    removed++;
                } else {
                    this.board[row][col] = backup;
                }
            }
        }
    }
    
    hasUniqueSolution() {
        const testBoard = this.deepCopy(this.board);
        let solutionCount = 0;
        
        const countSolutions = (board) => {
            const emptyCell = this.findEmptyCell(board);
            if (!emptyCell) {
                solutionCount++;
                return solutionCount <= 1;
            }
            
            const [row, col] = emptyCell;
            
            for (let num = 1; num <= 9; num++) {
                if (this.isValidMove(board, row, col, num)) {
                    board[row][col] = num;
                    
                    if (!countSolutions(board)) {
                        board[row][col] = 0;
                        return false;
                    }
                    
                    board[row][col] = 0;
                }
            }
            
            return true;
        };
        
        countSolutions(testBoard);
        return solutionCount === 1;
    }
    
    startGame() {
        this.generateSudoku();
        this.isGameActive = true;
        this.startTime = Date.now();
        this.errorCount = 0;
        this.hintCount = 0;
        this.moveHistory = [];
        
        this.elements.gameOverlay.style.display = 'none';
        this.elements.gameStatus.textContent = '游戏进行中';
        this.elements.difficultySelector.style.display = 'none';
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        
        this.startTimer();
        this.renderBoard();
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
    
    renderBoard() {
        const cells = this.elements.sudokuBoard.querySelectorAll('.sudoku-cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.board[row][col];
            
            cell.textContent = value || '';
            cell.className = 'sudoku-cell';
            
            if (this.initialBoard[row][col] !== 0) {
                cell.classList.add('prefilled');
            }
            
            // 只高亮当前选中的方格
            if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                cell.classList.add('selected');
            }
        });
    }
    
    selectCell(row, col) {
        if (!this.isGameActive) return;
        if (this.initialBoard[row][col] !== 0) return; // 不能选择预填充的单元格
        
        this.selectedCell = { row, col };
        this.renderBoard();
        
        if (this.selectedNumber && this.board[row][col] === 0) {
            this.makeMove(row, col, this.selectedNumber);
        }
    }
    
    selectNumber(number) {
        if (!this.isGameActive) return;
        
        // 更新数字按钮样式
        this.elements.numberButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.number) === number) {
                btn.classList.add('selected');
            }
        });
        
        this.selectedNumber = number;
        
        if (this.selectedCell) {
            const { row, col } = this.selectedCell;
            if (this.initialBoard[row][col] === 0) {
                this.makeMove(row, col, number);
                // 填入数字后清除数字按钮选中状态
                this.clearNumberSelection();
            }
        }
    }
    
    makeMove(row, col, number) {
        if (!this.isGameActive) return;
        
        // 保存移动历史
        this.moveHistory.push({
            row,
            col,
            previousValue: this.board[row][col],
            newValue: number
        });
        
        this.board[row][col] = number;
        
        // 检查是否正确
        if (this.solution[row][col] !== number) {
            this.errorCount++;
            this.showError(row, col);
        }
        
        this.renderBoard();
        this.updateDisplay();
        this.checkWin();
    }
    
    clearCell() {
        if (!this.isGameActive || !this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        if (this.initialBoard[row][col] !== 0) return;
        
        // 保存移动历史
        this.moveHistory.push({
            row,
            col,
            previousValue: this.board[row][col],
            newValue: 0
        });
        
        this.board[row][col] = 0;
        this.renderBoard();
        this.updateDisplay();
        
        // 清除单元格后清除数字选择
        this.clearNumberSelection();
    }
    
    giveHint() {
        if (!this.isGameActive || this.hintCount >= this.maxHints) return;
        
        // 找到一个空的单元格给出提示
        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const { row, col } = randomCell;
        
        // 保存移动历史
        this.moveHistory.push({
            row,
            col,
            previousValue: this.board[row][col],
            newValue: this.solution[row][col],
            isHint: true
        });
        
        this.board[row][col] = this.solution[row][col];
        this.hintCount++;
        
        this.showHint(row, col);
        this.renderBoard();
        this.updateDisplay();
        this.checkWin();
        
        // 使用提示后清除数字选择
        this.clearNumberSelection();
    }
    
    undoMove() {
        if (!this.isGameActive || this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = lastMove.previousValue;
        
        if (lastMove.isHint) {
            this.hintCount--;
        }
        
        this.renderBoard();
        this.updateDisplay();
        
        // 撤销后清除数字选择
        this.clearNumberSelection();
    }
    
    checkSolution() {
        if (!this.isGameActive) return;
        
        let hasErrors = false;
        const cells = this.elements.sudokuBoard.querySelectorAll('.sudoku-cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (this.board[row][col] !== 0 && this.board[row][col] !== this.solution[row][col]) {
                cell.classList.add('error');
                hasErrors = true;
                setTimeout(() => cell.classList.remove('error'), 2000);
            }
        });
        
        if (!hasErrors) {
            this.showMessage('目前没有错误！', 'success');
        } else {
            this.showMessage('发现错误，请检查红色标记的单元格', 'error');
        }
    }
    
    showError(row, col) {
        const cell = this.elements.sudokuBoard.children[row * 9 + col];
        cell.classList.add('error');
        setTimeout(() => cell.classList.remove('error'), 2000);
    }
    
    showHint(row, col) {
        const cell = this.elements.sudokuBoard.children[row * 9 + col];
        cell.classList.add('hint');
        setTimeout(() => cell.classList.remove('hint'), 2000);
    }
    
    checkWin() {
        const isComplete = this.board.every(row => row.every(cell => cell !== 0));
        if (!isComplete) return;
        
        const isCorrect = this.board.every((row, r) => 
            row.every((cell, c) => cell === this.solution[r][c])
        );
        
        if (isCorrect) {
            this.winGame();
        }
    }
    
    winGame() {
        this.isGameActive = false;
        this.stopTimer();
        
        const finalTime = this.formatTime(Date.now() - this.startTime);
        
        // 更新统计信息
        this.elements.finalTime.textContent = finalTime;
        this.elements.finalDifficulty.textContent = this.getDifficultyName();
        this.elements.errorCount.textContent = this.errorCount;
        this.elements.hintCountStat.textContent = this.hintCount;
        
        // 显示胜利界面
        this.elements.gameStats.style.display = 'grid';
        this.elements.difficultySelector.style.display = 'none';
        this.elements.gameOverlay.style.display = 'flex';
        this.elements.gameStatus.textContent = '游戏完成';
        
        // 显示胜利消息
        document.querySelector('.overlay-title').textContent = '恭喜完成！';
        document.querySelector('.overlay-text').textContent = `你在${this.getDifficultyName()}难度下，用时${finalTime}完成了数独！`;
        
        this.showMessage('恭喜！数独完成！', 'success');
    }
    
    getDifficultyName() {
        const names = {
            easy: '简单',
            medium: '中等',
            hard: '困难',
            expert: '专家'
        };
        return names[this.difficulty];
    }
    
    updateDisplay() {
        // 更新游戏信息
        this.elements.currentDifficulty.textContent = this.getDifficultyName();
        this.elements.currentErrors.textContent = this.errorCount;
        this.elements.hintsLeft.textContent = this.maxHints - this.hintCount;
        
        // 计算剩余空格
        const remainingCells = this.board.flat().filter(cell => cell === 0).length;
        this.elements.remainingCells.textContent = remainingCells;
        
        // 更新进度条
        const totalCells = 81;
        const filledCells = totalCells - remainingCells;
        const progress = (filledCells / totalCells) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${Math.round(progress)}%`;
        
        // 更新数字计数
        this.updateNumberCounts();
    }
    
    updateNumberCounts() {
        for (let num = 1; num <= 9; num++) {
            const count = this.board.flat().filter(cell => cell === num).length;
            const countElement = document.getElementById(`count${num}`);
            if (countElement) {
                countElement.textContent = `${count}/9`;
                const numberCount = countElement.closest('.number-count');
                if (count === 9) {
                    numberCount.classList.add('complete');
                } else {
                    numberCount.classList.remove('complete');
                }
            }
        }
    }
    
    clearNumberSelection() {
        this.selectedNumber = null;
        this.elements.numberButtons.forEach(btn => btn.classList.remove('selected'));
    }
    
    clearSelection() {
        this.selectedCell = null;
        this.selectedNumber = null;
        this.elements.numberButtons.forEach(btn => btn.classList.remove('selected'));
        if (this.elements.sudokuBoard.children.length > 0) {
            this.renderBoard();
        }
    }
    
    handleKeyPress(e) {
        if (!this.isGameActive) return;
        
        const key = e.key;
        
        // 数字键
        if (key >= '1' && key <= '9') {
            e.preventDefault();
            this.selectNumber(parseInt(key));
        }
        
        // 清除键
        if (key === 'Backspace' || key === 'Delete' || key === '0') {
            e.preventDefault();
            this.clearCell();
        }
        
        // 方向键
        if (this.selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.moveSelection(key);
        }
        
        // 快捷键
        if (e.ctrlKey || e.metaKey) {
            if (key === 'z') {
                e.preventDefault();
                this.undoMove();
            }
        }
    }
    
    moveSelection(direction) {
        if (!this.selectedCell) return;
        
        let { row, col } = this.selectedCell;
        
        switch (direction) {
            case 'ArrowUp':
                row = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                row = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                col = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                col = Math.min(8, col + 1);
                break;
        }
        
        this.selectCell(row, col);
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
    new SudokuGame();
}); 