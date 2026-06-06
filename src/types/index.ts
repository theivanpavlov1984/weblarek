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
    payment: TPayment;
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
