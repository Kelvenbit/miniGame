// 贪吃蛇游戏 - 像素风格
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏配置
        this.gridSize = 20;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.cols = this.canvasWidth / this.gridSize;
        this.rows = this.canvasHeight / this.gridSize;
        
        // 游戏状态
        this.gameState = 'waiting'; // waiting, playing, paused, ended
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameSpeed = 150; // 毫秒
        this.startTime = null;
        this.gameTime = 0;
        
        // 蛇的初始状态
        this.snake = [
            { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // 食物
        this.food = this.generateFood();
        
        // 游戏循环
        this.gameLoop = null;
        this.timeInterval = null;
        
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
            currentLength: document.getElementById('currentLength'),
            currentTime: document.getElementById('currentTime'),
            gameStatus: document.getElementById('gameStatus'),
            finalScore: document.getElementById('finalScore'),
            snakeLength: document.getElementById('snakeLength'),
            gameTime: document.getElementById('gameTime'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.draw();
        
        // 设置画布渲染属性
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }
    
    setupEventListeners() {
        // 按钮事件
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
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
                } else if (this.gameState === 'ended') {
                    this.restartGame();
                }
            }
            return;
        }
        
        // 游戏控制键
        switch(e.code) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
            case 'Space':
                this.togglePause();
                break;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.elements.overlay.style.display = 'none';
        
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        this.timeInterval = setInterval(() => this.updateTime(), 100);
        
        this.updateUI();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    resetGame() {
        // 停止游戏循环
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        
        // 重置游戏状态
        this.gameState = 'waiting';
        this.score = 0;
        this.gameTime = 0;
        this.startTime = null;
        
        // 重置蛇的位置
        this.snake = [
            { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // 重新生成食物
        this.food = this.generateFood();
        
        // 显示开始界面
        this.elements.overlay.style.display = 'flex';
        this.elements.overlayTitle.textContent = 'SNAKE GAME';
        this.elements.overlayText.textContent = '使用 WASD 或 方向键 控制蛇的移动';
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'none';
        this.elements.gameStats.style.display = 'none';
        
        this.updateUI();
        this.draw();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameLoop);
            clearInterval(this.timeInterval);
            this.elements.pauseBtn.textContent = '继续';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            this.timeInterval = setInterval(() => this.updateTime(), 100);
            this.elements.pauseBtn.textContent = '暂停';
        }
        this.updateUI();
    }
    
    update() {
        // 更新方向
        this.direction = { ...this.nextDirection };
        
        // 移动蛇头
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查食物碰撞
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            
            // 根据分数调整游戏速度
            this.adjustGameSpeed();
        } else {
            this.snake.pop();
        }
        
        this.updateUI();
        this.draw();
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    adjustGameSpeed() {
        const baseSpeed = 150;
        const speedIncrease = Math.floor(this.score / 50) * 10;
        this.gameSpeed = Math.max(baseSpeed - speedIncrease, 80);
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
    }
    
    gameOver() {
        this.gameState = 'ended';
        
        // 停止游戏循环
        clearInterval(this.gameLoop);
        clearInterval(this.timeInterval);
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
        
        // 显示游戏结束界面
        this.elements.overlay.style.display = 'flex';
        this.elements.overlayTitle.textContent = 'GAME OVER';
        this.elements.overlayText.textContent = this.score > this.highScore - 10 ? '新纪录！' : '再试一次？';
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.gameStats.style.display = 'block';
        
        // 更新统计信息
        this.elements.finalScore.textContent = this.score;
        this.elements.snakeLength.textContent = this.snake.length;
        this.elements.gameTime.textContent = this.formatTime(this.gameTime);
        
        this.updateUI();
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
        this.elements.currentLength.textContent = this.snake.length;
        this.elements.currentTime.textContent = this.formatTime(this.gameTime);
        
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
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    draw() {
        // 绘制16bit风格背景
        this.drawPixelBackground();
        
        // 绘制装饰性边框
        this.drawDecoativeBorder();
        
        // 绘制网格（可选）
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
    }
    
    drawPixelBackground() {
        // 创建16bit风格的渐变背景
        const width = this.canvasWidth;
        const height = this.canvasHeight;
        
        // 基础深色背景
        this.ctx.fillStyle = '#2d1b69';
        this.ctx.fillRect(0, 0, width, height);
        
        // 添加像素化的渐变效果
        for (let y = 0; y < height; y += 4) {
            const intensity = Math.sin(y / height * Math.PI) * 0.1;
            const brightness = Math.floor(45 + intensity * 20);
            this.ctx.fillStyle = `rgb(${brightness - 10}, ${brightness - 5}, ${brightness + 40})`;
            this.ctx.fillRect(0, y, width, 2);
        }
        
        // 添加像素化的星星装饰
        this.drawPixelStars();
    }
    
    drawPixelStars() {
        const stars = [
            { x: 50, y: 50 }, { x: 150, y: 30 }, { x: 250, y: 80 },
            { x: 350, y: 45 }, { x: 450, y: 70 }, { x: 520, y: 25 },
            { x: 80, y: 150 }, { x: 180, y: 180 }, { x: 320, y: 160 },
            { x: 420, y: 190 }, { x: 550, y: 140 }, { x: 30, y: 300 },
            { x: 130, y: 280 }, { x: 280, y: 320 }, { x: 380, y: 290 },
            { x: 480, y: 350 }, { x: 570, y: 310 }
        ];
        
        stars.forEach(star => {
            if (star.x < this.canvasWidth && star.y < this.canvasHeight) {
                // 绘制十字形像素星星
                this.ctx.fillStyle = '#7b68ee';
                this.ctx.fillRect(star.x, star.y, 1, 1);
                this.ctx.fillRect(star.x - 1, star.y, 1, 1);
                this.ctx.fillRect(star.x + 1, star.y, 1, 1);
                this.ctx.fillRect(star.x, star.y - 1, 1, 1);
                this.ctx.fillRect(star.x, star.y + 1, 1, 1);
                
                // 中心亮点
                this.ctx.fillStyle = '#4a90e2';
                this.ctx.fillRect(star.x, star.y, 1, 1);
            }
        });
    }
    
    drawDecoativeBorder() {
        const width = this.canvasWidth;
        const height = this.canvasHeight;
        
        // 绘制像素化装饰边框
        this.ctx.fillStyle = '#4a90e2';
        
        // 顶部边框装饰
        for (let x = 0; x < width; x += 8) {
            this.ctx.fillRect(x, 0, 4, 2);
            this.ctx.fillRect(x + 2, 2, 4, 2);
        }
        
        // 底部边框装饰
        for (let x = 0; x < width; x += 8) {
            this.ctx.fillRect(x, height - 2, 4, 2);
            this.ctx.fillRect(x + 2, height - 4, 4, 2);
        }
        
        // 左侧边框装饰
        for (let y = 0; y < height; y += 8) {
            this.ctx.fillRect(0, y, 2, 4);
            this.ctx.fillRect(2, y + 2, 2, 4);
        }
        
        // 右侧边框装饰
        for (let y = 0; y < height; y += 8) {
            this.ctx.fillRect(width - 2, y, 2, 4);
            this.ctx.fillRect(width - 4, y + 2, 2, 4);
        }
        
        // 角落装饰
        this.ctx.fillStyle = '#7b68ee';
        
        // 左上角
        this.ctx.fillRect(0, 0, 8, 8);
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fillRect(2, 2, 4, 4);
        
        // 右上角
        this.ctx.fillStyle = '#7b68ee';
        this.ctx.fillRect(width - 8, 0, 8, 8);
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fillRect(width - 6, 2, 4, 4);
        
        // 左下角
        this.ctx.fillStyle = '#7b68ee';
        this.ctx.fillRect(0, height - 8, 8, 8);
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fillRect(2, height - 6, 4, 4);
        
        // 右下角
        this.ctx.fillStyle = '#7b68ee';
        this.ctx.fillRect(width - 8, height - 8, 8, 8);
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fillRect(width - 6, height - 6, 4, 4);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(74, 144, 226, 0.08)';
        this.ctx.lineWidth = 1;
        
        // 垂直线 - 更淡的网格
        for (let x = this.gridSize; x < this.canvasWidth - this.gridSize; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.gridSize);
            this.ctx.lineTo(x, this.canvasHeight - this.gridSize);
            this.ctx.stroke();
        }
        
        // 水平线 - 更淡的网格
        for (let y = this.gridSize; y < this.canvasHeight - this.gridSize; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.gridSize, y);
            this.ctx.lineTo(this.canvasWidth - this.gridSize, y);
            this.ctx.stroke();
        }
        
        // 添加像素化的网格点
        this.ctx.fillStyle = 'rgba(123, 104, 238, 0.15)';
        for (let x = this.gridSize; x < this.canvasWidth; x += this.gridSize) {
            for (let y = this.gridSize; y < this.canvasHeight; y += this.gridSize) {
                this.ctx.fillRect(x - 1, y - 1, 1, 1);
            }
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // 蛇头 - 16bit像素艺术风格
                this.drawPixelSnakeHead(x, y);
            } else {
                // 蛇身 - 16bit像素艺术风格
                this.drawPixelSnakeBody(x, y, index);
            }
        });
    }
    
    drawPixelSnakeHead(x, y) {
        const size = this.gridSize;
        
        // 蛇头主体 - 深绿色基底
        this.ctx.fillStyle = '#2e7d32';
        this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        // 蛇头亮绿色区域
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
        
        // 顶部高光
        this.ctx.fillStyle = '#66bb6a';
        this.ctx.fillRect(x + 4, y + 3, size - 8, 2);
        
        // 左侧高光
        this.ctx.fillStyle = '#66bb6a';
        this.ctx.fillRect(x + 3, y + 4, 2, size - 10);
        
        // 右下阴影
        this.ctx.fillStyle = '#1b5e20';
        this.ctx.fillRect(x + size - 5, y + size - 5, 2, 2);
        this.ctx.fillRect(x + size - 4, y + size - 3, 1, 1);
        
        // 绘制像素化眼睛
        this.drawPixelEyes(x, y, size);
        
        // 绘制像素化嘴部（根据方向）
        this.drawPixelMouth(x, y, size);
        
        // 蛇头边框 - 像素完美
        this.ctx.strokeStyle = '#1b5e20';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
    
    drawPixelEyes(x, y, size) {
        const eyeColor = '#f8f9fa';
        const pupilColor = '#000';
        
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        // 根据方向调整眼睛位置
        if (this.direction.x === 1) { // 向右
            leftEyeX = x + size - 6; leftEyeY = y + 5;
            rightEyeX = x + size - 6; rightEyeY = y + size - 9;
        } else if (this.direction.x === -1) { // 向左
            leftEyeX = x + 4; leftEyeY = y + 5;
            rightEyeX = x + 4; rightEyeY = y + size - 9;
        } else if (this.direction.y === -1) { // 向上
            leftEyeX = x + 5; leftEyeY = y + 4;
            rightEyeX = x + size - 9; rightEyeY = y + 4;
        } else { // 向下
            leftEyeX = x + 5; leftEyeY = y + size - 6;
            rightEyeX = x + size - 9; rightEyeY = y + size - 6;
        }
        
        // 绘制眼白 (2x2像素)
        this.ctx.fillStyle = eyeColor;
        this.ctx.fillRect(leftEyeX, leftEyeY, 2, 2);
        this.ctx.fillRect(rightEyeX, rightEyeY, 2, 2);
        
        // 绘制瞳孔 (1x1像素)
        this.ctx.fillStyle = pupilColor;
        this.ctx.fillRect(leftEyeX + 1, leftEyeY + 1, 1, 1);
        this.ctx.fillRect(rightEyeX + 1, rightEyeY + 1, 1, 1);
        
        // 眼睛高光 (1x1像素)
        this.ctx.fillStyle = eyeColor;
        this.ctx.fillRect(leftEyeX, leftEyeY, 1, 1);
        this.ctx.fillRect(rightEyeX, rightEyeY, 1, 1);
    }
    
    drawPixelMouth(x, y, size) {
        this.ctx.fillStyle = '#1b5e20';
        
        // 根据方向绘制嘴部
        if (this.direction.x === 1) { // 向右
            this.ctx.fillRect(x + size - 3, y + size/2 - 1, 1, 2);
        } else if (this.direction.x === -1) { // 向左
            this.ctx.fillRect(x + 2, y + size/2 - 1, 1, 2);
        } else if (this.direction.y === -1) { // 向上
            this.ctx.fillRect(x + size/2 - 1, y + 2, 2, 1);
        } else { // 向下
            this.ctx.fillRect(x + size/2 - 1, y + size - 3, 2, 1);
        }
    }
    
    drawPixelSnakeBody(x, y, index) {
        const size = this.gridSize;
        const intensity = 1 - (index / this.snake.length) * 0.4;
        
        // 蛇身基色 - 根据位置调整颜色深浅
        const baseRed = Math.floor(76 * intensity);
        const baseGreen = Math.floor(175 * intensity);
        const baseBlue = Math.floor(80 * intensity);
        
        // 蛇身主体
        this.ctx.fillStyle = `rgb(${Math.floor(baseRed * 0.8)}, ${Math.floor(baseGreen * 0.8)}, ${Math.floor(baseBlue * 0.8)})`;
        this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        // 蛇身亮色区域
        this.ctx.fillStyle = `rgb(${baseRed}, ${baseGreen}, ${baseBlue})`;
        this.ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
        
        // 顶部和左侧高光
        this.ctx.fillStyle = `rgb(${Math.min(255, Math.floor(baseRed * 1.3))}, ${Math.min(255, Math.floor(baseGreen * 1.3))}, ${Math.min(255, Math.floor(baseBlue * 1.3))})`;
        this.ctx.fillRect(x + 4, y + 3, size - 8, 1);
        this.ctx.fillRect(x + 3, y + 4, 1, size - 8);
        
        // 右下阴影
        this.ctx.fillStyle = `rgb(${Math.floor(baseRed * 0.6)}, ${Math.floor(baseGreen * 0.6)}, ${Math.floor(baseBlue * 0.6)})`;
        this.ctx.fillRect(x + size - 4, y + size - 4, 1, 1);
        this.ctx.fillRect(x + size - 5, y + size - 4, 1, 1);
        this.ctx.fillRect(x + size - 4, y + size - 5, 1, 1);
        
        // 添加纹理点（每隔几个节增加细节）
        if (index % 3 === 0) {
            this.ctx.fillStyle = `rgb(${Math.floor(baseRed * 1.1)}, ${Math.floor(baseGreen * 1.1)}, ${Math.floor(baseBlue * 1.1)})`;
            this.ctx.fillRect(x + size/2 - 1, y + size/2 - 1, 1, 1);
        }
        
        // 蛇身边框
        this.ctx.strokeStyle = `rgb(${Math.floor(baseRed * 0.5)}, ${Math.floor(baseGreen * 0.5)}, ${Math.floor(baseBlue * 0.5)})`;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        const size = this.gridSize;
        
        // 16bit像素艺术风格的苹果
        this.drawPixelApple(x, y, size);
    }
    
    drawPixelApple(x, y, size) {
        // 苹果主体轮廓 - 深红色
        this.ctx.fillStyle = '#c62828';
        this.ctx.fillRect(x + 4, y + 6, size - 8, size - 10);
        this.ctx.fillRect(x + 3, y + 8, size - 6, size - 12);
        this.ctx.fillRect(x + 5, y + 5, size - 10, 2);
        
        // 苹果主体 - 红色
        this.ctx.fillStyle = '#f44336';
        this.ctx.fillRect(x + 5, y + 7, size - 10, size - 12);
        this.ctx.fillRect(x + 4, y + 9, size - 8, size - 14);
        
        // 苹果高光 - 亮红色
        this.ctx.fillStyle = '#ff6659';
        this.ctx.fillRect(x + 6, y + 8, size - 14, size - 14);
        this.ctx.fillRect(x + 5, y + 9, 2, size - 16);
        
        // 苹果反光高光 - 很亮的红色
        this.ctx.fillStyle = '#ffab91';
        this.ctx.fillRect(x + 6, y + 9, 1, 2);
        this.ctx.fillRect(x + 7, y + 8, 1, 1);
        
        // 苹果茎部 - 棕色
        this.ctx.fillStyle = '#5d4037';
        this.ctx.fillRect(x + size/2 - 1, y + 3, 2, 3);
        this.ctx.fillRect(x + size/2, y + 2, 1, 1);
        
        // 叶子 - 绿色
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(x + size/2 + 1, y + 3, 2, 1);
        this.ctx.fillRect(x + size/2 + 2, y + 4, 1, 1);
        
        // 叶子高光
        this.ctx.fillStyle = '#66bb6a';
        this.ctx.fillRect(x + size/2 + 1, y + 3, 1, 1);
        
        // 苹果底部阴影
        this.ctx.fillStyle = '#b71c1c';
        this.ctx.fillRect(x + 4, y + size - 5, size - 8, 1);
        this.ctx.fillRect(x + 5, y + size - 4, size - 10, 1);
        
        // 苹果左侧阴影
        this.ctx.fillStyle = '#d32f2f';
        this.ctx.fillRect(x + 4, y + 9, 1, size - 14);
        
        // 添加像素化纹理
        this.ctx.fillStyle = '#ef5350';
        this.ctx.fillRect(x + 8, y + 10, 1, 1);
        this.ctx.fillRect(x + 10, y + 12, 1, 1);
        
        // 苹果轮廓描边
        this.ctx.strokeStyle = '#b71c1c';
        this.ctx.lineWidth = 1;
        // 不用strokeRect，而是手动绘制像素完美的轮廓
        this.drawPixelBorder(x + 4, y + 6, size - 8, size - 10);
    }
    
    drawPixelBorder(x, y, width, height) {
        // 手动绘制像素完美的边框
        this.ctx.fillStyle = '#b71c1c';
        
        // 顶边
        this.ctx.fillRect(x, y, width, 1);
        // 底边  
        this.ctx.fillRect(x, y + height - 1, width, 1);
        // 左边
        this.ctx.fillRect(x, y, 1, height);
        // 右边
        this.ctx.fillRect(x + width - 1, y, 1, height);
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
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