// 飞翔小鸟游戏 - 32bit像素风格
class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 800;
        
        // 32bit像素风格颜色方案
        this.colors = {
            bgTop: '#0f1419',
            bgMiddle: '#1a1a2e',
            bgBottom: '#16213e',
            ground: '#2c3e50',
            groundDark: '#34495e',
            pipe: '#34495e',
            pipeDark: '#2c3e50',
            pipeLight: '#4a6741',
            birdPrimary: '#e74c3c',
            birdSecondary: '#c0392b',
            birdAccent: '#f39c12',
            particle: '#3498db',
            cloud: '#2c3e50',
            star: '#f1c40f'
        };
        
        // 游戏状态
        this.gameState = 'start'; // start, playing, gameOver, paused
        this.score = 0;
        this.bestScore = localStorage.getItem('flappyBestScore') || 0;
        this.distance = 0;
        
        // 游戏物理参数 - 适配更大的画布
        this.gravity = 0.35;
        this.jumpForce = -9;
        this.gameSpeed = 3;
        
        // 小鸟属性 - 适配更大的画布
        this.bird = {
            x: 120,
            y: 350,
            width: 40,
            height: 30,
            velocity: 0,
            rotation: 0,
            wingPhase: 0
        };
        
        // 管道数组 - 适配更大的画布
        this.pipes = [];
        this.pipeWidth = 70;
        this.pipeGap = 200;
        this.pipeSpacing = 280;
        
        // 背景元素
        this.clouds = [];
        this.stars = [];
        this.groundOffset = 0;
        
        // 粒子效果
        this.particles = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initClouds();
        this.initStars();
        this.updateBestScoreDisplay();
        this.updateInfoPanel();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 开始按钮
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // 重新开始按钮
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 暂停按钮
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleJump();
            } else if (e.code === 'KeyR') {
                this.restartGame();
            } else if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        // 鼠标/触摸控制
        this.canvas.addEventListener('click', () => {
            this.handleJump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
    }
    
    handleJump() {
        if (this.gameState === 'start') {
            this.startGame();
        } else if (this.gameState === 'playing') {
            this.bird.velocity = this.jumpForce;
            this.createParticles(this.bird.x, this.bird.y, 5);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.updateGameStatus('游戏进行中');
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.hideOverlay();
        this.updateGameStatus('游戏进行中');
    }
    
    restartGame() {
        this.score = 0;
        this.distance = 0;
        this.bird = {
            x: 120,
            y: 350,
            width: 40,
            height: 30,
            velocity: 0,
            rotation: 0,
            wingPhase: 0
        };
        this.pipes = [];
        this.particles = [];
        this.updateScore();
        this.updateInfoPanel();
        this.startGame();
    }
    
    resetGame() {
        this.gameState = 'start';
        this.restartGame();
        this.showOverlay();
        this.updateGameStatus('等待开始');
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.updateGameStatus('游戏暂停');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.updateGameStatus('游戏进行中');
        }
    }
    
    showOverlay() {
        document.getElementById('gameOverlay').classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
    
    initClouds() {
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 300 + 50,
                width: Math.random() * 80 + 60,
                height: Math.random() * 40 + 30,
                speed: Math.random() * 0.8 + 0.3
            });
        }
    }
    
    initStars() {
        for (let i = 0; i < 12; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200 + 20,
                size: Math.random() * 3 + 1,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // 更新小鸟
        this.updateBird();
        
        // 更新管道
        this.updatePipes();
        
        // 更新背景
        this.updateBackground();
        
        // 更新粒子
        this.updateParticles();
        
        // 更新距离
        this.distance += this.gameSpeed;
        
        // 检测碰撞
        this.checkCollisions();
        
        // 更新信息面板
        this.updateInfoPanel();
    }
    
    updateBird() {
        // 应用重力
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // 计算旋转角度 - 更平滑的旋转
        this.bird.rotation = Math.max(-30, Math.min(this.bird.velocity * 4, 90));
        
        // 翅膀动画
        this.bird.wingPhase += 0.3;
        if (this.bird.wingPhase > Math.PI * 2) {
            this.bird.wingPhase = 0;
        }
        
        // 防止飞出上边界
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
    }
    
    updatePipes() {
        // 生成新管道
        if (this.pipes.length === 0 || 
            this.pipes[this.pipes.length - 1].x < this.canvas.width - this.pipeSpacing) {
            this.createPipe();
        }
        
        // 更新管道位置
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.gameSpeed;
            
            // 检查得分
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateScore();
                this.createParticles(this.bird.x, this.bird.y, 10);
            }
            
            // 移除离开屏幕的管道
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    createPipe() {
        const minHeight = 120;
        const maxHeight = this.canvas.height - this.pipeGap - 120 - minHeight;
        const topHeight = Math.random() * maxHeight + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false
        });
    }
    
    updateBackground() {
        // 更新地面偏移
        this.groundOffset = (this.groundOffset + this.gameSpeed) % 60;
        
        // 更新云朵
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * 300 + 50;
            }
        });
        
        // 更新星星
        this.stars.forEach(star => {
            star.x -= star.speed;
            star.twinkle += 0.1;
            if (star.x < 0) {
                star.x = this.canvas.width;
                star.y = Math.random() * 200 + 20;
            }
        });
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.15; // 重力影响
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    createParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                life: 40,
                color: this.colors.particle,
                size: Math.random() * 3 + 2
            });
        }
    }
    
    checkCollisions() {
        const bird = this.bird;
        
        // 地面碰撞
        if (bird.y + bird.height >= this.canvas.height - 80) {
            this.gameOver();
            return;
        }
        
        // 管道碰撞 - 更精确的碰撞检测
        for (const pipe of this.pipes) {
            if (bird.x + bird.width > pipe.x + 8 && 
                bird.x < pipe.x + this.pipeWidth - 8) {
                
                if (bird.y < pipe.topHeight || 
                    bird.y + bird.height > pipe.bottomY) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // 更新最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
        
        // 显示游戏结束界面
        this.showGameOverScreen();
        
        // 创建爆炸效果
        this.createParticles(this.bird.x, this.bird.y, 20);
        
        this.updateGameStatus('游戏结束');
    }
    
    showGameOverScreen() {
        document.getElementById('overlayTitle').textContent = 'GAME OVER';
        document.getElementById('overlayText').textContent = '再试一次，挑战更高分数！';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('bestScore').textContent = this.bestScore;
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('restartBtn').style.display = 'inline-block';
        document.getElementById('gameStats').style.display = 'block';
        
        this.showOverlay();
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景渐变 - 32bit像素风格
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.colors.bgTop);
        gradient.addColorStop(0.4, this.colors.bgMiddle);
        gradient.addColorStop(1, this.colors.bgBottom);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制星星
        this.drawStars();
        
        // 绘制云朵
        this.drawClouds();
        
        // 绘制管道
        this.drawPipes();
        
        // 绘制小鸟
        this.drawBird();
        
        // 绘制地面
        this.drawGround();
        
        // 绘制粒子
        this.drawParticles();
        
        // 如果暂停，绘制暂停指示
        if (this.gameState === 'paused') {
            this.drawPauseIndicator();
        }
    }
    
    drawStars() {
        this.stars.forEach(star => {
            const alpha = (Math.sin(star.twinkle) + 1) / 2 * 0.8 + 0.2;
            this.ctx.fillStyle = this.colors.star;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawClouds() {
        this.ctx.fillStyle = this.colors.cloud;
        this.ctx.globalAlpha = 0.6;
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            // 绘制32bit风格的云朵
            this.ctx.arc(cloud.x, cloud.y, cloud.width / 5, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 5, cloud.y - 8, cloud.width / 6, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 4, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width * 0.7, cloud.y - 5, cloud.width / 6, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width * 0.9, cloud.y, cloud.width / 7, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawPipes() {
        this.pipes.forEach(pipe => {
            // 32bit像素风格管道
            this.ctx.fillStyle = this.colors.pipe;
            
            // 上管道
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // 下管道
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, 
                this.canvas.height - pipe.bottomY - 80);
            
            // 管道边框 - 32bit像素风格
            this.ctx.strokeStyle = this.colors.pipeDark;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, 
                this.canvas.height - pipe.bottomY - 80);
            
            // 管道装饰帽 - 更厚重的32bit风格
            this.ctx.fillStyle = this.colors.pipeLight;
            this.ctx.fillRect(pipe.x - 6, pipe.topHeight - 35, this.pipeWidth + 12, 35);
            this.ctx.fillRect(pipe.x - 6, pipe.bottomY, this.pipeWidth + 12, 35);
            
            this.ctx.strokeStyle = this.colors.pipeDark;
            this.ctx.strokeRect(pipe.x - 6, pipe.topHeight - 35, this.pipeWidth + 12, 35);
            this.ctx.strokeRect(pipe.x - 6, pipe.bottomY, this.pipeWidth + 12, 35);
            
            // 管道纹理 - 32bit像素细节
            this.ctx.strokeStyle = this.colors.pipeDark;
            this.ctx.lineWidth = 1;
            for (let y = 0; y < pipe.topHeight; y += 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(pipe.x + 10, y);
                this.ctx.lineTo(pipe.x + this.pipeWidth - 10, y);
                this.ctx.stroke();
            }
            for (let y = pipe.bottomY; y < this.canvas.height - 80; y += 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(pipe.x + 10, y);
                this.ctx.lineTo(pipe.x + this.pipeWidth - 10, y);
                this.ctx.stroke();
            }
        });
    }
    
    drawBird() {
        const bird = this.bird;
        
        this.ctx.save();
        this.ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        this.ctx.rotate(bird.rotation * Math.PI / 180);
        
        // 32bit像素风格小鸟身体
        this.ctx.fillStyle = this.colors.birdPrimary;
        this.ctx.beginPath();
        this.ctx.ellipse(-3, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 鸟身体阴影
        this.ctx.fillStyle = this.colors.birdSecondary;
        this.ctx.beginPath();
        this.ctx.ellipse(-3, 2, bird.width / 2.5, bird.height / 2.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 鸟身体边框
        this.ctx.strokeStyle = this.colors.birdSecondary;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.ellipse(-3, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 翅膀 - 动态翅膀动画，32bit风格
        const wingOffset = Math.sin(this.bird.wingPhase) * 4;
        this.ctx.fillStyle = this.colors.birdAccent;
        this.ctx.beginPath();
        this.ctx.ellipse(-bird.width / 3, wingOffset, bird.width / 2.5, bird.height / 2.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = this.colors.birdSecondary;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 眼睛 - 32bit像素风格
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(6, -8, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(8, -8, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 眼睛高光
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(10, -10, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 鸟嘴 - 32bit像素风格
        this.ctx.fillStyle = this.colors.birdAccent;
        this.ctx.beginPath();
        this.ctx.moveTo(bird.width / 2 - 6, -2);
        this.ctx.lineTo(bird.width / 2 + 12, -4);
        this.ctx.lineTo(bird.width / 2 + 12, 4);
        this.ctx.lineTo(bird.width / 2 - 6, 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = this.colors.birdSecondary;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawGround() {
        // 32bit像素风格地面
        this.ctx.fillStyle = this.colors.ground;
        this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);
        
        // 地面边框
        this.ctx.strokeStyle = this.colors.groundDark;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 80);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 80);
        this.ctx.stroke();
        
        // 32bit像素风格地面纹理
        this.ctx.strokeStyle = this.colors.groundDark;
        this.ctx.lineWidth = 2;
        for (let x = -this.groundOffset; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height - 80);
            this.ctx.lineTo(x, this.canvas.height - 60);
            this.ctx.stroke();
            
            // 添加一些细节
            if (x % 40 === 0) {
                this.ctx.fillStyle = this.colors.groundDark;
                this.ctx.fillRect(x, this.canvas.height - 75, 6, 10);
            }
        }
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 40;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawPauseIndicator() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '24px Courier New';
        this.ctx.fillText('按ESC或点击继续', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateBestScoreDisplay() {
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('highScore').textContent = this.bestScore;
    }
    
    updateInfoPanel() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('distance').textContent = Math.floor(this.distance / 15);
    }
    
    updateGameStatus(status) {
        document.getElementById('gameStatus').textContent = status;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 等待DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new FlappyBirdGame();
}); 