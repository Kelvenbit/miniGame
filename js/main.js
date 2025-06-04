// 游戏数据配置
const games = {
    snake: {
        title: '贪吃蛇',
        path: 'games/snake/index.html',
        description: '经典街机游戏，控制小蛇吃食物'
    },
    tetris: {
        title: '俄罗斯方块',
        path: 'games/tetris/index.html',
        description: '消除方块，挑战高分'
    },
    '2048': {
        title: '2048',
        path: 'games/2048/index.html',
        description: '数字合并，达到2048'
    },
    sudoku: {
        title: '数独',
        path: 'games/sudoku/index.html',
        description: '逻辑推理，填满9x9网格'
    },
    solitaire: {
        title: '纸牌接龙',
        path: 'games/solitaire/index.html',
        description: '经典纸牌游戏，按花色整理牌面'
    },
    flappy: {
        title: '飞翔小鸟',
        path: 'games/flappy-bird/index.html',
        description: '点击屏幕，避开障碍物'
    },
    puzzle: {
        title: '拼图游戏',
        path: 'games/puzzle/index.html',
        description: '移动拼图块，还原图片'
    },
    memory: {
        title: '记忆卡片',
        path: 'games/memory/index.html',
        description: '翻开卡片，找到相同图案'
    },
    'click-speed': {
        title: '点击速度测试',
        path: 'games/click-speed/index.html',
        description: '测试反应速度和点击能力'
    }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeGameCards();
    addScrollAnimations();
});

// 初始化游戏卡片事件
function initializeGameCards() {
    const gameCards = document.querySelectorAll('.game-card');
    console.log('找到游戏卡片数量:', gameCards.length);
    
    gameCards.forEach(card => {
        const gameType = card.dataset.game;
        console.log('初始化游戏卡片:', gameType);
        
        // 点击事件
        card.addEventListener('click', () => {
            console.log('点击游戏卡片:', gameType);
            openGame(gameType);
        });
        
        // 键盘访问性支持
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openGame(gameType);
            }
        });
        
        // 添加tabindex使卡片可聚焦
        card.setAttribute('tabindex', '0');
    });
}

// 打开游戏
function openGame(gameType) {
    console.log('尝试打开游戏:', gameType);
    const game = games[gameType];
    
    if (!game) {
        console.log('游戏配置不存在:', gameType);
        showMessage('游戏暂未开发完成，敬请期待！', 'warning');
        return;
    }
    
    console.log('打开游戏路径:', game.path);
    // 直接打开游戏页面
    window.location.href = game.path;
}

// 显示消息提示
function showMessage(message, type = 'info') {
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
        borderRadius: '12px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '300px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    });
    
    // 根据类型设置背景色
    const bgColors = {
        info: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)'
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

// 添加滚动动画
function addScrollAnimations() {
    // 检查是否支持 Intersection Observer
    if (!window.IntersectionObserver) return;
    
    const cards = document.querySelectorAll('.game-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        observer.observe(card);
    });
}

// 添加CSS动画类（通过JavaScript注入）
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .game-card {
            opacity: 0;
            transform: translateY(30px);
        }
        
        .game-card.animate-in {
            animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// 页面加载时添加动画样式
addAnimationStyles(); 