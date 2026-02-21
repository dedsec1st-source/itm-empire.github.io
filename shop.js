// ===== МАГАЗИН LTM =====
class LTMShop {
    constructor(finance) {
        if (!finance) {
            console.error('LTMShop: finance не передан');
            return;
        }
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
            }
        ];
        this.load();
    }
    
    // Загрузка инвентаря
    load() {
        try {
            let saved = localStorage.getItem(`ltm_inventory_${this.finance.userId}`);
            if (saved) {
                this.inventory = JSON.parse(saved);
            } else {
                this.inventory = [];
            }
        } catch (e) {
            console.error('Ошибка загрузки инвентаря:', e);
            this.inventory = [];
        }
    }
    
    // Сохранение инвентаря
    save() {
        try {
            localStorage.setItem(`ltm_inventory_${this.finance.userId}`, JSON.stringify(this.inventory));
        } catch (e) {
            console.error('Ошибка сохранения инвентаря:', e);
        }
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
            stickers: { name: '🎨 Стикеры', icon: '🎨', count: this.items.filter(i => i.category === 'stickers').length }
        };
    }
    
    // Купить предмет
    buy(itemId) {
        let item = this.items.find(i => i.id === itemId);
        if (!item) {
            return { success: false, error: 'Товар не найден' };
        }
        
        // Проверяем, есть ли уже
        let hasItem = this.inventory.some(i => i.id === itemId);
        if (hasItem) {
            return { success: false, error: 'У вас уже есть этот предмет' };
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
    
    // Получить инвентарь
    getInventory() {
        return this.inventory;
    }
    
    // Применить эффекты предметов
    applyEffects(stats) {
        let equipped = this.inventory.filter(i => i.equipped);
        
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

// Делаем класс глобально доступным
window.LTMShop = LTMShop;

console.log('✅ LTMShop загружен');
