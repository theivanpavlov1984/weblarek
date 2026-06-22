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

// ===== View Interfaces =====

// Колбэк действия пользователя над элементом (клик)
export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

// Хедер: счётчик товаров на иконке корзины
export interface IHeader {
    counter: number;
}

// Галерея: список карточек каталога
export interface IGallery {
    catalog: HTMLElement[];
}

// Модальное окно
export interface IModal {
    content: HTMLElement | null;
}

// Базовая карточка (только отображаемые данные, без id)
export interface ICard {
    title: string;
    price: number | null;
}

// Карточка каталога
export interface ICardCatalog extends ICard {
    image: string;
    category: string;
}

// Карточка превью (детальный просмотр)
export interface ICardPreview extends ICardCatalog {
    description: string;
    buttonText: string;
    buttonDisabled: boolean;
}

// Карточка в корзине
export interface ICardBasket extends ICard {
    index: number;
}

// Вид корзины
export interface IBasketView {
    items: HTMLElement[];
    total: number;
}

// Базовое состояние формы
export interface IFormState {
    valid: boolean;
    errors: string;
}

// Форма оплаты и адреса (шаг 1)
export interface IOrderPaymentView extends IFormState {
    payment: TPayment | null;
    address: string;
}

// Форма контактов (шаг 2)
export interface IOrderContactsView extends IFormState {
    email: string;
    phone: string;
}

// Экран успешного заказа
export interface ISuccessView {
    total: number;
}
