export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

// Виды оплаты
export type TPayment = 'card' | 'cash';

// Товар
export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

// Покупатель
export interface IBuyer {
    payment: TPayment | null;
    email: string;
    phone: string;
    address: string;
}

// Объект, который мы отправляем на сервер при оформлении заказа
export interface IOrderRequest extends IBuyer {
    items: string[];   // массив id выбранных товаров
    total: number;     // итоговая сумма
}

// Ответ сервера на GET /product/
export interface IProductsResponse {
    total: number;
    items: IProduct[];
}

// Ответ сервера на POST /order/ (подтверждение покупки)
export interface IOrderResponse {
    id: string;
    total: number;
}

// Объект ошибок валидации покупателя
export type TBuyerValidationErrors = Partial<Record<keyof IBuyer, string>>;

// Интерфейс модели каталога товаров
export interface IProductsModel {
    setItems(items: IProduct[]): void;
    getItems(): IProduct[];
    getItemById(id: string): IProduct | undefined;
    setPreview(item: IProduct): void;
    getPreview(): IProduct | null;
}

// Интерфейс модели корзины
export interface IBasketModel {
    getItems(): IProduct[];
    addItem(item: IProduct): void;
    removeItem(item: IProduct): void;
    clear(): void;
    getTotalPrice(): number;
    getCount(): number;
    hasItem(id: string): boolean;
}

// Интерфейс модели покупателя
export interface IBuyerModel {
    setField(field: keyof IBuyer, value: string): void;
    getData(): IBuyer;
    clear(): void;
    validate(): TBuyerValidationErrors;
}
