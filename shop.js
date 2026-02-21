// ===== МАГАЗИН LTM =====
class LTMShop {
    constructor(finance) {
        this.finance = finance;
        this.inventory = [];
        this.items = [
            // Бусты для кликера
            {
                id: 'boost_x2',
                name: '⚡ Множитель x2',
                description: 'Удвой доход от кликов навсегда',
                price: 50,
                type: 'boost',
                effect: 'multiplier',
                value: 2,
                icon: '⚡',
                category: 'boosts'
            },
            {
                id: 'boost_x5',
                name: '🔥 Множитель x5',
                description: 'Упятери доход от кликов',
                price: 200,
                type: 'boost',
                effect: 'multiplier',
                value: 5,
                icon: '🔥',
                category: 'boosts'
            },
            {
                id: 'auto_clicker',
                name: '🤖 Автокликер',
                description: '10 кликов в минуту автоматически',
                price: 100,
                type: 'boost',
                effect: 'auto',
                value: 10,
                icon: '🤖',
                category: 'boosts'
            },
            
            // Стикеры
            {
                id: 'sticker_skull',
                name: '💀 Череп',
                description: 'Анимированный череп',
                price: 5,
                type: 'sticker',
                icon: '💀',
                category: 'stickers'
            },
            {
                id: 'sticker_crown',
                name: '👑 Корона',
                description: 'Императорская корона',
                price: 15,
                type: 'sticker',
                icon: '👑',
                category: 'stickers'
            },
            {
                id: 'sticker_raven',
                name: '🦇 Ворон',
                description: 'Готический ворон',
                price: 10,
                type: 'sticker',
                icon: '🦇',
                category: 'stickers'
            },
            {
                id: 'sticker_empire',
                name: '🏴 Флаг империи',
                description: 'Флаг LTM Empire',
                price: 20,
                type: 'sticker',
                icon: '🏴',
                category: 'stickers'
            },
            
            // Темы оформления
            {
                id: 'theme_gold',
                name: '✨ Золотая тема',
                description: 'Императорское золото',
                price: 100,
                type: 'theme',
                cssClass: 'theme-gold',
                icon: '✨',
                category: 'themes'
            },
            {
                id: 'theme_blood',
                name: '🩸 Кровавая тема',
                description: 'Красный как кровь',
                price: 80,
                type: 'theme',
                cssClass: 'theme-blood',
                icon: '🩸',
                category: 'themes'
            },
            {
                id: 'theme_dark',
                name: '🌑 Тёмная тема',
                description: 'Классическая готика',
                price: 50,
                type: 'theme',
                cssClass: 'theme-dark',
                icon: '🌑',
                category: 'themes'
            },
            
            // Привилегии
            {
                id: 'vip_week',
                name: '👑 VIP на неделю',
                description: 'Без рекламы, х2 доход',
                price: 150,
                type: 'vip',
                duration: 7, // дней
                icon: '👑',
                category: 'vip'
            },
            {
                id: 'vip_month',
                name: '👑 VIP на месяц',
                description: 'Без рекламы, х3 доход',
                price: 500,
                type: 'vip',
                duration: 30,
                icon: '👑',
                category: 'vip'
            },
            
            // Специальные предметы
            {
                id: 'name_color',
                name: '🌈 Цвет ника',
                description: 'Выделяйся в чате',
                price: 30,
                type: 'special',
                icon: '🌈',
                category: 'special'
            },
            {
                id: 'profile_frame',
                name: '🖼️ Рамка профиля',
                description: 'Красивая рамка аватара',
                price: 40,
                type: 'special',
                icon: '🖼️',
                category: 'special'
            }
        ];
        
        this.load();
    }
    
    // Загрузка инвентаря
    load() {
        let saved = localStorage.getItem(`ltm_inventory_${this.finance.userId}`);
        if (saved) {
            this.inventory = JSON.parse(saved);
        } else {
            // Базовые предметы для нового пользователя
            this.inventory = [];
        }
    }
    
    // Сохранение инвентаря
    save() {
        localStorage.setItem(`ltm_inventory_${this.finance.userId}`, JSON.stringify(this.inventory));
    }
    
    // Получить все товары (с фильтром)
    getItems(category = null) {
        if (category) {
            return this.items.filter(item => item.category === category);
        }
        return this.items;
    }
    
    // Получить категории
    getCategories() {
        return {
            boosts: { name: '⚡ Бусты', icon: '⚡', count: this.items.filter(i => i.category === 'boosts').length },
            stickers: { name: '🎨 Стикеры', icon: '🎨', count: this.items.filter(i => i.category === 'stickers').length },
            themes: { name: '🎭 Темы', icon: '🎭', count: this.items.filter(i => i.category === 'themes').length },
            vip: { name: '👑 VIP', icon: '👑', count: this.items.filter(i => i.category === 'vip').length },
            special: { name: '✨ Особое', icon: '✨', count: this.items.filter(i => i.category === 'special').length }
        };
    }
    
    // Купить предмет
    buy(itemId) {
        let item = this.items.find(i => i.id === itemId);
        if (!item) {
            return { success: false, error: 'Товар не найден' };
        }
        
        // Проверяем, есть ли уже (для уникальных предметов)
        if (item.type === 'theme' || item.type === 'sticker') {
            let hasItem = this.inventory.some(i => i.id === itemId);
            if (hasItem) {
                return { success: false, error: 'У вас уже есть этот предмет' };
            }
        }
        
        // Проверяем баланс
        if (this.finance.getBalance() < item.price) {
            return { 
                success: false, 
                error: 'Недостаточно LTM',
                need: item.price - this.finance.getBalance(),
                balance: this.finance.getBalance()
            };
        }
        
        // Списываем LTM
        if (this.finance.spend(item.price, `Покупка: ${item.name}`)) {
            // Добавляем в инвентарь
            this.inventory.push({
                id: item.id,
                name: item.name,
                type: item.type,
                icon: item.icon,
                purchased: Date.now(),
                equipped: false
            });
            
            this.save();
            
            return {
                success: true,
                item: item,
                balance: this.finance.getBalance()
            };
        }
        
        return { success: false, error: 'Ошибка транзакции' };
    }
    
    // Использовать/экипировать предмет
    equip(itemId) {
        let inventoryItem = this.inventory.find(i => i.id === itemId);
        if (!inventoryItem) {
            return { success: false, error: 'Предмет не найден' };
        }
        
        // Снимаем предыдущий предмет того же типа
        let item = this.items.find(i => i.id === itemId);
        if (item) {
            this.inventory.forEach(i => {
                if (i.type === item.type && i.equipped) {
                    i.equipped = false;
                }
            });
        }
        
        inventoryItem.equipped = !inventoryItem.equipped;
        this.save();
        
        return {
            success: true,
            equipped: inventoryItem.equipped,
            item: inventoryItem
        };
    }
    
    // Получить экипированные предметы
    getEquipped() {
        return this.inventory.filter(i => i.equipped);
    }
    
    // Получить инвентарь
    getInventory(type = null) {
        if (type) {
            return this.inventory.filter(i => i.type === type);
        }
        return this.inventory;
    }
    
    // Применить эффекты предметов
    applyEffects(stats) {
        let equipped = this.getEquipped();
        
        equipped.forEach(item => {
            let itemData = this.items.find(i => i.id === item.id);
            if (itemData && itemData.effect) {
                switch(itemData.effect) {
                    case 'multiplier':
                        stats.clickMultiplier = (stats.clickMultiplier || 1) * itemData.value;
                        break;
                    case 'auto':
                        stats.autoClicks = (stats.autoClicks || 0) + itemData.value;
                        break;
                }
            }
        });
        
        return stats;
    }
}

// ===== ИСТОРИЯ ТРАНЗАКЦИЙ (UI КОМПОНЕНТ) =====
function renderTransactionHistory(transactions, containerId) {
    let container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="transactions-list">';
    
    transactions.forEach(t => {
        let date = new Date(t.timestamp).toLocaleString();
        let sign = t.type === 'income' || t.type === 'transfer_in' ? '+' : '-';
        let color = t.type === 'income' || t.type === 'transfer_in' ? '#00ff00' : '#8b0000';
        
        html += `
            <div class="transaction-item" style="border-left: 3px solid ${color}; padding: 10px; margin: 5px; background: #1a1a1a; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>${t.reason || t.type}</span>
                    <span style="color: ${color};">${sign}${t.amount.toFixed(2)} LTM</span>
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 5px;">
                    ${date} · Баланс: ${t.balance.toFixed(2)} LTM
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ===== UI КОМПОНЕНТ КОШЕЛЬКА =====
function createWalletWidget(finance, containerId) {
    let container = document.getElementById(containerId);
    if (!container) return;
    
    let widget = document.createElement('div');
    widget.className = 'wallet-widget';
    widget.style.cssText = `
        background: #1a1a1a;
        border: 1px solid #8b0000;
        border-radius: 10px;
        padding: 15px;
        margin: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    widget.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">💰</span>
            <div>
                <div style="color: #888; font-size: 12px;">LTM Balance</div>
                <div style="color: #d4af37; font-size: 24px; font-weight: bold;" id="wallet-balance">${finance.getBalance().toFixed(2)}</div>
            </div>
        </div>
        <div style="display: flex; gap: 5px;">
            <button class="wallet-btn" onclick="showTransferModal()" style="background: #2a2a2a; border: 1px solid #8b0000; color: #d4af37; padding: 8px 15px; border-radius: 5px; cursor: pointer;">📤 Перевод</button>
            <button class="wallet-btn" onclick="showHistoryModal()" style="background: #2a2a2a; border: 1px solid #8b0000; color: #d4af37; padding: 8px 15px; border-radius: 5px; cursor: pointer;">📊 История</button>
        </div>
    `;
    
    container.appendChild(widget);
    
    // Подписка на обновления
    finance.subscribe((balance) => {
        document.getElementById('wallet-balance').innerText = balance.toFixed(2);
    });
}

// ===== МОДАЛКА ПЕРЕВОДА =====
function showTransferModal(finance) {
    let modal = document.createElement('div');
    modal.className = 'transfer-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #2a2a2a;
        border: 2px solid #8b0000;
        border-radius: 15px;
        padding: 25px;
        z-index: 10000;
        width: 90%;
        max-width: 400px;
        color: #fff;
    `;
    
    modal.innerHTML = `
        <h3 style="color: #d4af37; margin-bottom: 20px;">💰 Перевод LTM</h3>
        <div style="margin-bottom: 15px;">
            <label style="color: #888;">Баланс: ${finance.getBalance().toFixed(2)} LTM</label>
        </div>
        <input type="text" id="transfer-to" placeholder="ID пользователя" style="width: 100%; padding: 12px; margin: 10px 0; background: #3a3a3a; border: 1px solid #8b0000; border-radius: 8px; color: #fff;">
        <input type="number" id="transfer-amount" placeholder="Сумма LTM" min="0.01" step="0.01" style="width: 100%; padding: 12px; margin: 10px 0; background: #3a3a3a; border: 1px solid #8b0000; border-radius: 8px; color: #fff;">
        <input type="text" id="transfer-comment" placeholder="Комментарий (необязательно)" style="width: 100%; padding: 12px; margin: 10px 0; background: #3a3a3a; border: 1px solid #8b0000; border-radius: 8px; color: #fff;">
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button onclick="doTransfer()" style="flex: 1; background: #8b0000; color: #fff; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">Перевести</button>
            <button onclick="closeTransferModal()" style="flex: 1; background: #3a3a3a; color: #fff; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">Отмена</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Фон
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 9999;
    `;
    overlay.onclick = closeTransferModal;
    document.body.appendChild(overlay);
    
    window.doTransfer = function() {
        let to = document.getElementById('transfer-to').value.trim();
        let amount = parseFloat(document.getElementById('transfer-amount').value);
        let comment = document.getElementById('transfer-comment').value.trim();
        
        if (!to) {
            alert('Введите ID получателя');
            return;
        }
        
        if (!amount || amount <= 0) {
            alert('Введите сумму');
            return;
        }
        
        let result = finance.transfer(to, amount, comment);
        
        if (result.success) {
            alert(`✅ Переведено ${amount} LTM пользователю ${to}`);
            closeTransferModal();
        } else {
            alert(`❌ Ошибка: ${result.error}`);
        }
    };
}

function closeTransferModal() {
    document.querySelector('.transfer-modal')?.remove();
    document.querySelector('.modal-overlay')?.remove();
}

// ===== МОДАЛКА ИСТОРИИ =====
function showHistoryModal(finance) {
    let modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #2a2a2a;
        border: 2px solid #8b0000;
        border-radius: 15px;
        padding: 25px;
        z-index: 10000;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        color: #fff;
    `;
    
    let history = finance.getHistory(50);
    let historyHtml = '';
    
    history.forEach(t => {
        let date = new Date(t.timestamp).toLocaleString();
        let sign = t.type === 'income' || t.type === 'transfer_in' ? '+' : '-';
        let color = t.type === 'income' || t.type === 'transfer_in' ? '#00ff00' : '#8b0000';
        
        historyHtml += `
            <div style="border-left: 3px solid ${color}; padding: 10px; margin: 5px; background: #1a1a1a; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>${t.reason || t.type}</span>
                    <span style="color: ${color};">${sign}${t.amount.toFixed(2)} LTM</span>
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 5px;">
                    ${date} · Баланс: ${t.balance.toFixed(2)} LTM
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <h3 style="color: #d4af37; margin-bottom: 20px;">📊 История операций</h3>
        <div style="margin-bottom: 15px;">
            <span style="color: #888;">Текущий баланс: </span>
            <span style="color: #d4af37; font-size: 20px; font-weight: bold;">${finance.getBalance().toFixed(2)} LTM</span>
        </div>
        <div class="history-list">
            ${historyHtml || '<div style="text-align: center; color: #888; padding: 20px;">Нет операций</div>'}
        </div>
        <div style="margin-top: 20px;">
            <button onclick="closeHistoryModal()" style="width: 100%; background: #3a3a3a; color: #fff; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">Закрыть</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 9999;
    `;
    overlay.onclick = closeHistoryModal;
    document.body.appendChild(overlay);
}

function closeHistoryModal() {
    document.querySelector('.history-modal')?.remove();
    document.querySelector('.modal-overlay')?.remove();
}

// ===== ЭКСПОРТ =====
// Для использования в других файлах
window.LTMFinance = LTMFinance;
window.LTMClickerIntegration = LTMClickerIntegration;
window.LTMLikesIntegration = LTMLikesIntegration;
window.LTMShop = LTMShop;
window.createWalletWidget = createWalletWidget;
window.showTransferModal = showTransferModal;
window.showHistoryModal = showHistoryModal;
