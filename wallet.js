// ===== LTM ФИНАНСОВАЯ СИСТЕМА =====
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
        try {
            let savedBalance = localStorage.getItem(`ltm_balance_${this.userId}`);
            let savedTransactions = localStorage.getItem(`ltm_transactions_${this.userId}`);
            
            this.balance = savedBalance ? parseFloat(savedBalance) : 0;
            this.transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        } catch (e) {
            console.error('Ошибка загрузки кошелька:', e);
            this.balance = 0;
            this.transactions = [];
        }
    }
    
    // Сохранение
    save() {
        try {
            localStorage.setItem(`ltm_balance_${this.userId}`, this.balance);
            localStorage.setItem(`ltm_transactions_${this.userId}`, JSON.stringify(this.transactions));
            
            // Уведомляем подписчиков
            this.notifyListeners();
        } catch (e) {
            console.error('Ошибка сохранения кошелька:', e);
        }
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
}

// Делаем класс глобально доступным
window.LTMFinance = LTMFinance;

console.log('✅ LTMFinance загружен');
