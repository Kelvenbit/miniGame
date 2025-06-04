/**
 * 极限反应速度测试游戏
 * 像素游戏合集 - Ultimate Reaction Time Test
 */

class UltimateReactionTimeGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            currentRound: 0,
            totalRounds: 10,
            reactionTimes: [],
            currentReactionTime: 0,
            gamePhase: 'waiting', // waiting, ready, clicked, early
            colorChangeTime: 0,
            waitTimeRange: [2000, 5000], // 默认2-5秒
            gameTimer: null,
            testResults: []
        };

        this.settings = {
            maxReactionTime: 2000, // 超过2秒算失败
            roundOptions: [5, 10, 15, 20],
            waitTimeOptions: {
                '1-3': [1000, 3000],
                '2-5': [2000, 5000],
                '3-7': [3000, 7000]
            }
        };

        this.statistics = this.loadStatistics();
        
        // 移除音效系统 - 可能影响计时精度
        this.sounds = null;

        this.init();
    }

    init() {
        this.initElements();
        this.initEventListeners();
        this.updateDisplay();
        this.updateStatistics();
        
        // 预热浏览器JIT编译
        this.warmupBrowser();
    }

    warmupBrowser() {
        // 预热关键函数以避免JIT编译延迟
        for (let i = 0; i < 100; i++) {
            performance.now();
            Math.random();
            Math.round(Math.random() * 1000);
        }
    }

    initElements() {
        this.elements = {
            // 游戏控制元素
            gameOverlay: document.getElementById('gameOverlay'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            reactionCircle: document.getElementById('reactionCircle'),
            statusText: document.getElementById('statusText'),
            instructionText: document.getElementById('instructionText'),
            
            // 设置元素
            testRounds: document.getElementById('testRounds'),
            waitTime: document.getElementById('waitTime'),
            
            // 显示元素
            currentReaction: document.getElementById('currentReaction'),
            averageReaction: document.getElementById('averageReaction'),
            currentRound: document.getElementById('currentRound'),
            currentTime: document.getElementById('currentTime'),
            avgTime: document.getElementById('avgTime'),
            bestTime: document.getElementById('bestTime'),
            gameStatus: document.getElementById('gameStatus'),
            
            // 进度条
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            
            // 图表
            reactionChart: document.getElementById('reactionChart'),
            
            // 游戏统计
            gameStats: document.getElementById('gameStats'),
            fastestTime: document.getElementById('fastestTime'),
            finalAverage: document.getElementById('finalAverage'),
            slowestTime: document.getElementById('slowestTime'),
            reactionLevel: document.getElementById('reactionLevel'),
            
            // 历史记录
            personalBest: document.getElementById('personalBest'),
            totalTests: document.getElementById('totalTests'),
            avgAllTime: document.getElementById('avgAllTime'),
            consistency: document.getElementById('consistency'),
            
            // 等级系统
            ratingItems: document.querySelectorAll('.rating-item')
        };

        // 预缓存DOM样式，避免运行时查询
        this.circleElement = this.elements.reactionCircle;
        this.circleStyle = this.circleElement.style;
    }

    initEventListeners() {
        // 开始游戏
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 极限反应圆圈点击 - 使用最快的事件
        this.circleElement.addEventListener('mousedown', (e) => this.handleUltimateClick(e));
        this.circleElement.addEventListener('touchstart', (e) => this.handleUltimateClick(e), { passive: false });
        
        // 防止右键菜单和拖拽
        this.circleElement.addEventListener('contextmenu', (e) => e.preventDefault());
        this.circleElement.addEventListener('dragstart', (e) => e.preventDefault());
        this.circleElement.addEventListener('selectstart', (e) => e.preventDefault());
        
        // 设置变更
        this.elements.testRounds.addEventListener('change', () => this.updateSettings());
        this.elements.waitTime.addEventListener('change', () => this.updateSettings());
        
        // 键盘支持 - 只支持空格键以获得最快响应
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleUltimateClick(e);
            }
        });
    }

    updateSettings() {
        this.gameState.totalRounds = parseInt(this.elements.testRounds.value);
        const waitTimeKey = this.elements.waitTime.value;
        this.gameState.waitTimeRange = this.settings.waitTimeOptions[waitTimeKey];
    }

    startGame() {
        this.updateSettings();
        this.resetGameState();
        
        this.gameState.isPlaying = true;
        this.elements.gameOverlay.classList.add('hidden');
        
        this.updateGameStatus('极限测试中');
        this.startNewRound();
    }

    restartGame() {
        this.stopAllTimers();
        this.showGameStart();
    }

    resetGameState() {
        this.gameState.currentRound = 0;
        this.gameState.reactionTimes = [];
        this.gameState.testResults = [];
        this.gameState.currentReactionTime = 0;
        this.gameState.gamePhase = 'waiting';
        this.stopAllTimers();
        this.updateDisplay();
    }

    startNewRound() {
        this.gameState.currentRound++;
        this.gameState.gamePhase = 'waiting';
        
        // 设置红色状态 - 使用最直接的方式
        this.circleStyle.backgroundColor = '#f44336';
        this.circleStyle.borderColor = '#f44336';
        this.elements.statusText.textContent = '等待...';
        this.elements.instructionText.textContent = '准备...绿色立即点击';
        
        // 随机等待时间
        const waitTime = this.getRandomWaitTime();
        
        this.gameState.gameTimer = setTimeout(() => {
            this.showUltimateReadyState();
        }, waitTime);
        
        this.updateDisplay();
    }

    getRandomWaitTime() {
        const [min, max] = this.gameState.waitTimeRange;
        return Math.random() * (max - min) + min;
    }

    showUltimateReadyState() {
        if (!this.gameState.isPlaying) return;
        
        this.gameState.gamePhase = 'ready';
        
        // 立即记录时间并改变颜色 - 最精确的方式
        this.gameState.colorChangeTime = performance.now();
        this.circleStyle.backgroundColor = '#4caf50';
        this.circleStyle.borderColor = '#4caf50';
        this.elements.statusText.textContent = '点击！';
        this.elements.instructionText.textContent = 'NOW!';
        
        // 设置超时
        this.gameState.gameTimer = setTimeout(() => {
            this.handleTimeout();
        }, this.settings.maxReactionTime);
    }

    handleUltimateClick(event) {
        // 立即记录点击时间 - 最高优先级
        const clickTime = performance.now();
        
        if (!this.gameState.isPlaying) {
            if (!this.elements.gameOverlay.classList.contains('hidden')) {
                this.startGame();
            }
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (this.gameState.gamePhase === 'waiting') {
            // 过早点击
            this.handleEarlyClick();
        } else if (this.gameState.gamePhase === 'ready') {
            // 极限反应点击
            const reactionTime = clickTime - this.gameState.colorChangeTime;
            this.handleUltimateReaction(reactionTime);
        }
    }

    handleEarlyClick() {
        this.gameState.gamePhase = 'early';
        this.stopAllTimers();
        
        // 显示早点击状态
        this.circleStyle.backgroundColor = '#ff9800';
        this.circleStyle.borderColor = '#ff9800';
        this.elements.statusText.textContent = '太早了！';
        this.elements.instructionText.textContent = '等待绿色出现';
        
        // 记录为失败
        this.gameState.reactionTimes.push(null);
        this.gameState.testResults.push({
            round: this.gameState.currentRound,
            reactionTime: null,
            result: 'early'
        });
        
        // 等待后继续下一轮
        setTimeout(() => {
            this.continueOrFinish();
        }, 1200);
    }

    handleUltimateReaction(reactionTime) {
        this.gameState.gamePhase = 'clicked';
        this.gameState.currentReactionTime = Math.round(reactionTime);
        this.stopAllTimers();
        
        // 立即显示结果
        this.circleStyle.backgroundColor = '#2196f3';
        this.circleStyle.borderColor = '#2196f3';
        this.elements.statusText.textContent = `${this.gameState.currentReactionTime}ms`;
        this.elements.instructionText.textContent = this.getUltimateRatingText(this.gameState.currentReactionTime);
        
        // 记录极限反应时间
        this.gameState.reactionTimes.push(this.gameState.currentReactionTime);
        this.gameState.testResults.push({
            round: this.gameState.currentRound,
            reactionTime: this.gameState.currentReactionTime,
            result: 'success'
        });
        
        // 更新图表
        this.updateChart();
        
        // 等待后继续下一轮
        setTimeout(() => {
            this.continueOrFinish();
        }, 1200);
        
        this.updateDisplay();
    }

    handleTimeout() {
        this.gameState.gamePhase = 'timeout';
        
        // 显示超时状态
        this.circleStyle.backgroundColor = '#757575';
        this.circleStyle.borderColor = '#757575';
        this.elements.statusText.textContent = '超时！';
        this.elements.instructionText.textContent = '反应太慢';
        
        // 记录为失败
        this.gameState.reactionTimes.push(null);
        this.gameState.testResults.push({
            round: this.gameState.currentRound,
            reactionTime: null,
            result: 'timeout'
        });
        
        // 等待后继续下一轮
        setTimeout(() => {
            this.continueOrFinish();
        }, 1200);
    }

    continueOrFinish() {
        if (this.gameState.currentRound >= this.gameState.totalRounds) {
            this.finishUltimateTest();
        } else {
            this.startNewRound();
        }
    }

    finishUltimateTest() {
        this.gameState.isPlaying = false;
        this.stopAllTimers();
        
        // 计算极限统计数据
        const validTimes = this.gameState.reactionTimes.filter(time => time !== null);
        const stats = this.calculateUltimateStatistics(validTimes);
        
        // 更新玩家统计
        this.updatePlayerStatistics(stats);
        
        // 显示极限结果
        this.showUltimateResults(stats);
        
        this.updateGameStatus('极限测试完成');
    }

    calculateUltimateStatistics(validTimes) {
        if (validTimes.length === 0) {
            return {
                average: 0,
                fastest: 0,
                slowest: 0,
                successRate: 0,
                rating: 'slow'
            };
        }

        const average = Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length);
        const fastest = Math.min(...validTimes);
        const slowest = Math.max(...validTimes);
        const successRate = Math.round((validTimes.length / this.gameState.totalRounds) * 100);
        const rating = this.calculateUltimateRating(average);

        return {
            average,
            fastest,
            slowest,
            successRate,
            rating
        };
    }

    calculateUltimateRating(averageTime) {
        // 极限反应速度等级系统
        if (averageTime < 120) return 'godlike';      // 神级 < 120ms
        if (averageTime < 150) return 'superhuman';   // 超人 < 150ms  
        if (averageTime < 180) return 'legendary';    // 传奇 < 180ms
        if (averageTime < 200) return 'excellent';    // 优秀 < 200ms
        if (averageTime < 230) return 'good';         // 良好 < 230ms
        if (averageTime < 270) return 'average';      // 一般 < 270ms
        if (averageTime < 320) return 'slow';         // 较慢 < 320ms
        return 'poor';                                // 很慢 >= 320ms
    }

    getUltimateRatingText(reactionTime) {
        const rating = this.calculateUltimateRating(reactionTime);
        const texts = {
            'godlike': '🔥神级！',
            'superhuman': '⚡超人！',
            'legendary': '🏆传奇！',
            'excellent': '✨优秀！',
            'good': '👍良好！',
            'average': '😐一般',
            'slow': '😕较慢',
            'poor': '😞很慢'
        };
        return texts[rating];
    }

    showUltimateResults(stats) {
        // 更新结果数据
        this.elements.fastestTime.textContent = `${stats.fastest}ms`;
        this.elements.finalAverage.textContent = `${stats.average}ms`;
        this.elements.slowestTime.textContent = `${stats.slowest}ms`;
        this.elements.reactionLevel.textContent = this.getUltimateRatingText(stats.average);
        
        // 显示统计面板
        this.elements.gameStats.style.display = 'block';
        
        // 切换按钮
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        
        // 显示覆盖层
        this.elements.gameOverlay.classList.remove('hidden');
        
        // 高亮对应等级
        this.highlightUltimateRating(stats.rating);
    }

    highlightUltimateRating(rating) {
        this.elements.ratingItems.forEach(item => {
            if (item.dataset.level === rating) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    showGameStart() {
        this.resetGameState();
        
        // 重置圆圈状态
        this.circleStyle.backgroundColor = '#16213e';
        this.circleStyle.borderColor = '#4a90e2';
        this.elements.statusText.textContent = '准备开始';
        this.elements.instructionText.textContent = '极限反应测试';
        
        // 隐藏统计面板
        this.elements.gameStats.style.display = 'none';
        
        // 切换按钮
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'none';
        
        // 显示覆盖层
        this.elements.gameOverlay.classList.remove('hidden');
        
        this.updateDisplay();
        this.updateGameStatus('等待开始');
        
        // 清除等级高亮
        this.elements.ratingItems.forEach(item => item.classList.remove('active'));
    }

    updateDisplay() {
        // 更新头部显示
        this.elements.currentReaction.textContent = `${this.gameState.currentReactionTime}ms`;
        
        const validTimes = this.gameState.reactionTimes.filter(time => time !== null);
        const avgTime = validTimes.length > 0 
            ? Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length)
            : 0;
        this.elements.averageReaction.textContent = `${avgTime}ms`;
        
        // 更新信息面板
        this.elements.currentRound.textContent = `${this.gameState.currentRound}/${this.gameState.totalRounds}`;
        this.elements.currentTime.textContent = `${this.gameState.currentReactionTime}ms`;
        this.elements.avgTime.textContent = `${avgTime}ms`;
        
        const bestTime = validTimes.length > 0 ? Math.min(...validTimes) : 0;
        this.elements.bestTime.textContent = `${bestTime}ms`;
        
        // 更新进度条
        this.updateProgress();
    }

    updateProgress() {
        const progress = (this.gameState.currentRound / this.gameState.totalRounds) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${Math.round(progress)}%`;
    }

    updateChart() {
        const chartContainer = this.elements.reactionChart;
        
        // 清空现有图表
        chartContainer.innerHTML = '';
        
        // 创建极限反应图表
        this.gameState.reactionTimes.forEach((time, index) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            
            if (time !== null) {
                const height = Math.min((time / 400) * 100, 100); // 最大400ms作为100%高度
                bar.style.height = `${height}%`;
                bar.setAttribute('data-value', `${time}ms`);
                
                // 根据极限反应时间设置颜色
                const rating = this.calculateUltimateRating(time);
                const colors = {
                    'godlike': '#e91e63',      // 粉红 - 神级
                    'superhuman': '#9c27b0',   // 紫色 - 超人
                    'legendary': '#ff5722',    // 深橙 - 传奇
                    'excellent': '#4caf50',    // 绿色 - 优秀
                    'good': '#2196f3',         // 蓝色 - 良好
                    'average': '#ff9800',      // 橙色 - 一般
                    'slow': '#ff5722',         // 红橙 - 较慢
                    'poor': '#f44336'          // 红色 - 很慢
                };
                bar.style.background = colors[rating];
            } else {
                bar.style.height = '10px';
                bar.style.background = '#666';
                bar.setAttribute('data-value', 'X');
            }
            
            chartContainer.appendChild(bar);
        });
    }

    updatePlayerStatistics(stats) {
        this.statistics.totalTests++;
        this.statistics.allResults.push(stats);
        
        // 保持最近50次记录
        if (this.statistics.allResults.length > 50) {
            this.statistics.allResults = this.statistics.allResults.slice(-50);
        }
        
        // 更新最佳记录
        if (stats.fastest > 0 && (this.statistics.personalBest === 0 || stats.fastest < this.statistics.personalBest)) {
            this.statistics.personalBest = stats.fastest;
        }
        
        // 计算历史平均
        const validResults = this.statistics.allResults.filter(result => result.average > 0);
        if (validResults.length > 0) {
            this.statistics.avgAllTime = Math.round(
                validResults.reduce((sum, result) => sum + result.average, 0) / validResults.length
            );
        }
        
        // 计算稳定性
        this.statistics.consistency = this.calculateConsistency();
        
        this.saveStatistics();
        this.updateStatistics();
    }

    calculateConsistency() {
        const recentResults = this.statistics.allResults.slice(-10);
        const averages = recentResults.map(result => result.average).filter(avg => avg > 0);
        
        if (averages.length < 2) return 0;
        
        const mean = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
        const variance = averages.reduce((sum, avg) => sum + Math.pow(avg - mean, 2), 0) / averages.length;
        const stdDev = Math.sqrt(variance);
        
        const consistency = Math.max(0, 100 - (stdDev / mean * 100));
        return Math.round(consistency);
    }

    updateStatistics() {
        this.elements.personalBest.textContent = `${this.statistics.personalBest}ms`;
        this.elements.totalTests.textContent = this.statistics.totalTests;
        this.elements.avgAllTime.textContent = `${this.statistics.avgAllTime}ms`;
        this.elements.consistency.textContent = `${this.statistics.consistency}%`;
    }

    updateGameStatus(status) {
        this.elements.gameStatus.textContent = status;
    }

    stopAllTimers() {
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
            this.gameState.gameTimer = null;
        }
    }

    loadStatistics() {
        const defaultStats = {
            personalBest: 0,
            avgAllTime: 0,
            totalTests: 0,
            consistency: 0,
            allResults: []
        };
        
        try {
            const saved = localStorage.getItem('ultimateReactionStats');
            return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
        } catch (error) {
            console.warn('无法加载统计数据:', error);
            return defaultStats;
        }
    }

    saveStatistics() {
        try {
            localStorage.setItem('ultimateReactionStats', JSON.stringify(this.statistics));
        } catch (error) {
            console.warn('无法保存统计数据:', error);
        }
    }
}

// 极限游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    window.ultimateReactionGame = new UltimateReactionTimeGame();
    
    console.log('🔥 极限反应速度测试已加载');
    console.log('⚡ 极限精度: 直接计时，无延迟补偿');
    console.log('🎯 支持: 鼠标点击、触摸、空格键');
    console.log('🏆 极限等级: 神级<120ms, 超人<150ms, 传奇<180ms');
}); 