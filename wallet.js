// ===== LTM ФИНАНСОВАЯ СИСТЕМА =====
// Подключать во все файлы (мессенджер, кликер, ленту, профиль)

class LTMFinance {
    constructor(userId) {
        this.userId = userId;
        this.balance = 0;
        this.transactions = [];
        this.listeners = [];
        this.load();
    }
    
    // Загрузка данных
    load() {
        let savedBalance = localStorage.getItem(`ltm_balance_${this.userId}`);
        let savedTransactions = localStorage.getItem(`ltm_transactions_${this.userId}`);
        
        this.balance = savedBalance ? parseFloat(savedBalance) : 0;
        this.transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
    }
    
    // Сохранение
    save() {
        localStorage.setItem(`ltm_balance_${this.userId}`, this.balance);
        localStorage.setItem(`ltm_transactions_${this.userId}`, JSON.stringify(this.transactions));
        
        // Уведомляем подписчиков
        this.notifyListeners();
        
        // Обновляем общую статистику
        this.updateGlobalStats();
    }
    
    // Получить баланс
    getBalance() {
        return this.balance;
    }
    
    // Добавить LTM
    add(amount, reason, from = null) {
        if (amount <= 0) return false;
        
        this.balance += amount;
        this.transactions.push({
            id: Date.now() + Math.random(),
            type: 'income',
            amount: amount,
            balance: this.balance,
            reason: reason,
            from: from,
            timestamp: Date.now()
        });
        
        this.save();
        return true;
    }
    
    // Списать LTM
    spend(amount, reason, to = null) {
        if (amount <= 0) return false;
        if (this.balance < amount) return false;
        
        this.balance -= amount;
        this.transactions.push({
            id: Date.now() + Math.random(),
            type: 'spend',
            amount: amount,
            balance: this.balance,
            reason: reason,
            to: to,
            timestamp: Date.now()
        });
        
        this.save();
        return true;
    }
    
    // Перевод другому пользователю
    transfer(toUserId, amount, comment = '') {
        if (amount <= 0) return { success: false, error: 'Сумма должна быть положительной' };
        if (this.balance < amount) return { success: false, error: 'Недостаточно LTM' };
        if (toUserId === this.userId) return { success: false, error: 'Нельзя перевести самому себе' };
        
        // Списываем у себя
        this.spend(amount, `Перевод пользователю ${toUserId}`, toUserId);
        
        // Зачисляем получателю
        let recipientFinance = new LTMFinance(toUserId);
        recipientFinance.add(amount, `Перевод от ${this.userId}`, this.userId);
        
        // Сохраняем историю перевода
        let transferId = Date.now();
        
        this.transactions.push({
            id: transferId,
            type: 'transfer_out',
            amount: amount,
            to: toUserId,
            comment: comment,
            timestamp: Date.now()
        });
        
        recipientFinance.transactions.push({
            id: transferId,
            type: 'transfer_in',
            amount: amount,
            from: this.userId,
            comment: comment,
            timestamp: Date.now()
        });
        
        this.save();
        recipientFinance.save();
        
        return { success: true, transferId: transferId };
    }
    
    // Получить историю
    getHistory(limit = 50) {
        return this.transactions.slice(-limit).reverse();
    }
    
    // Подписка на изменения
    subscribe(callback) {
        this.listeners.push(callback);
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.balance, this.transactions));
    }
    
    // Обновление глобальной статистики
    updateGlobalStats() {
        let totalLTM = parseFloat(localStorage.getItem('ltm_total_supply')) || 0;
        totalLTM += this.balance; // Упрощённо
        localStorage.setItem('ltm_total_supply', totalLTM);
    }
    
    // Очистить всё (для теста)
    reset() {
        this.balance = 0;
        this.transactions = [];
        this.save();
    }
}

// ===== ИНТЕГРАЦИЯ С КЛИКЕРОМ =====
class LTMClickerIntegration {
    constructor(finance) {
        this.finance = finance;
        this.clicks = 0;
        this.rate = 0.01; // 1 клик = 0.01 LTM
        this.multiplier = 1;
        this.load();
    }
    
    load() {
        let saved = localStorage.getItem(`ltm_clicker_${this.finance.userId}`);
        if (saved) {
            let data = JSON.parse(saved);
            this.clicks = data.clicks || 0;
            this.multiplier = data.multiplier || 1;
        }
    }
    
    save() {
        localStorage.setItem(`ltm_clicker_${this.finance.userId}`, JSON.stringify({
            clicks: this.clicks,
            multiplier: this.multiplier
        }));
    }
    
    // Обработка клика
    handleClick() {
        this.clicks++;
        let earned = this.rate * this.multiplier;
        
        this.finance.add(earned, `Клик #${this.clicks} (x${this.multiplier})`);
        this.save();
        
        return {
            clicks: this.clicks,
            earned: earned,
            total: this.finance.getBalance()
        };
    }
    
    // Купить множитель
    buyMultiplier() {
        let cost = 10 * Math.pow(2, this.multiplier - 1);
        
        if (this.finance.spend(cost, `Покупка множителя x${this.multiplier + 1}`)) {
            this.multiplier++;
            this.save();
            return { success: true, multiplier: this.multiplier };
        }
        
        return { success: false, error: 'Недостаточно LTM' };
    }
}

// ===== ИНТЕГРАЦИЯ С ЛЕНТОЙ =====
class LTMLikesIntegration {
    constructor(finance) {
        this.finance = finance;
        this.likesGiven = 0;
        this.likesReceived = 0;
        this.bonusRate = 0.1; // 10 лайков = 1 LTM
        this.load();
    }
    
    load() {
        let saved = localStorage.getItem(`ltm_likes_${this.finance.userId}`);
        if (saved) {
            let data = JSON.parse(saved);
            this.likesGiven = data.likesGiven || 0;
            this.likesReceived = data.likesReceived || 0;
        }
    }
    
    save() {
        localStorage.setItem(`ltm_likes_${this.finance.userId}`, JSON.stringify({
            likesGiven: this.likesGiven,
            likesReceived: this.likesReceived
        }));
    }
    
    // Когда лайкают твой пост
    receiveLike() {
        this.likesReceived++;
        this.save();
        
        // Каждые 10 лайков - бонус
        if (this.likesReceived % 10 === 0) {
            let bonus = this.bonusRate * 10;
            this.finance.add(bonus, `Бонус за ${this.likesReceived} лайков`);
            return { bonus: bonus };
        }
        
        return { bonus: 0 };
    }
    
    // Когда ты лайкаешь пост
    giveLike() {
        this.likesGiven++;
        this.save();
    }
}

// ===== МАГАЗИН LTM =====
class LTMS
