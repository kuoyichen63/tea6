export interface Drink {
  id: string;
  name: string;
  category: string;
  prices: {
    M?: number; // 中
    L?: number; // 大
    B?: number; // 瓶
  };
  details?: string;
  fixedSweetness?: boolean;
}

export const MENU: Drink[] = [
  {
    id: 'chulu-milk-tea',
    name: '初鹿鮮奶茶',
    category: '小農鮮奶系列',
    prices: { M: 50, L: 55, B: 85 }
  },
  {
    id: 'chulu-milk-green-tea',
    name: '初鹿鮮奶綠',
    category: '小農鮮奶系列',
    prices: { M: 50, L: 55, B: 85 }
  },
  {
    id: 'red-bean-milk-tea',
    name: '紅豆鮮奶茶',
    category: '小農鮮奶系列',
    details: '含紅豆.珍珠',
    prices: { M: 55, L: 60, B: 90 }
  },
  {
    id: 'pudding-milk-tea',
    name: '布丁鮮奶茶',
    category: '小農鮮奶系列',
    prices: { M: 60, L: 65 }
  },
  {
    id: 'pearl-milk-tea',
    name: '珍珠鮮奶茶',
    category: '小農鮮奶系列',
    prices: { M: 55, L: 60, B: 90 }
  },
  {
    id: 'pearl-milk-green-tea',
    name: '珍珠鮮奶綠',
    category: '小農鮮奶系列',
    prices: { M: 55, L: 60, B: 90 }
  },
  {
    id: 'taro-milk',
    name: '大甲芋頭鮮奶',
    category: '小農鮮奶系列',
    details: '甜度固定',
    fixedSweetness: true,
    prices: { M: 65, L: 80 }
  },
  {
    id: 'taro-sago',
    name: '芋頭西米露',
    category: '小農鮮奶系列',
    details: '甜度固定',
    fixedSweetness: true,
    prices: { M: 65, L: 80 }
  },
  {
    id: 'taro-pearl',
    name: '芋泥珠珠',
    category: '小農鮮奶系列',
    details: '甜度固定',
    fixedSweetness: true,
    prices: { M: 65, L: 80 }
  }
];

export const ICE_LEVELS = ['正常冰', '少冰', '微冰', '去冰', '完全去冰', '常溫', '溫', '熱'];
export const SWEETNESS_LEVELS = ['正常糖', '少糖', '半糖', '微糖', '無糖'];
