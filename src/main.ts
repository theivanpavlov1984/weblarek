import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { LarekApi } from './components/LarekApi';

import { Page } from './components/View/Page';
import { Modal } from './components/View/Modal';
import { CardCatalog } from './components/View/CardCatalog';
import { CardPreview } from './components/View/CardPreview';
import { CardBasket } from './components/View/CardBasket';
import { BasketView } from './components/View/BasketView';
import { OrderPayment } from './components/View/OrderPayment';
import { OrderContacts } from './components/View/OrderContacts';
import { Success } from './components/View/Success';

import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IBuyer, TPayment } from './types/index';

// ── EventEmitter ───────────────────────────────────────────────────────────────
const events = new EventEmitter();

// ── Models ─────────────────────────────────────────────────────────────────────
const productsModel = new Products(events);
const basketModel   = new Basket(events);
const buyerModel    = new Buyer(events);

// ── API ────────────────────────────────────────────────────────────────────────
const baseApi  = new Api(API_URL);
const larekApi = new LarekApi(baseApi);

// ── Templates ──────────────────────────────────────────────────────────────────
const cardCatalogTpl = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTpl = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTpl  = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTpl      = ensureElement<HTMLTemplateElement>('#basket');
const orderTpl       = ensureElement<HTMLTemplateElement>('#order');
const contactsTpl    = ensureElement<HTMLTemplateElement>('#contacts');
const successTpl     = ensureElement<HTMLTemplateElement>('#success');

// ── Persistent View instances ──────────────────────────────────────────────────
const page         = new Page(document.body, events);
const modal        = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basketView   = new BasketView(cloneTemplate(basketTpl), events);
const orderPayView = new OrderPayment(cloneTemplate<HTMLFormElement>(orderTpl), events);
const contactsView = new OrderContacts(cloneTemplate<HTMLFormElement>(contactsTpl), events);
const successView  = new Success(cloneTemplate(successTpl), events);

// ── Helper: собрать разметку элементов корзины ────────────────────────────────
function buildBasketItems(): HTMLElement[] {
    return basketModel.getItems().map((item, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTpl), events);
        return card.render({
            id: item.id,
            index: index + 1,
            title: item.title,
            price: item.price,
        });
    });
}

// ── Presenter: обработчики событий ────────────────────────────────────────────

// Каталог обновился → отрисовать карточки в галерее
events.on('catalog:changed', () => {
    const cards = productsModel.getItems().map((item) => {
        const card = new CardCatalog(cloneTemplate(cardCatalogTpl), events);
        return card.render({
            id: item.id,
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            price: item.price,
        });
    });
    page.catalog = cards;
});

// Клик по карточке → сохранить в превью
events.on('card:select', ({ id }: { id: string }) => {
    const item = productsModel.getItemById(id);
    if (item) productsModel.setPreview(item);
});

// Превью изменилось → открыть модалку с детальной карточкой
events.on('preview:changed', () => {
    const item = productsModel.getPreview();
    if (!item) return;
    const card = new CardPreview(cloneTemplate(cardPreviewTpl), events);
    modal.render({
        content: card.render({
            id: item.id,
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            price: item.price,
            description: item.description,
            inBasket: basketModel.hasItem(item.id),
        }),
    });
});

// Кнопка «Купить» / «Удалить из корзины» в превью
events.on('card:buy', ({ id }: { id: string }) => {
    const item = productsModel.getItemById(id);
    if (!item) return;
    if (basketModel.hasItem(id)) {
        basketModel.removeItem(item);
    } else {
        basketModel.addItem(item);
    }
    modal.close();
});

// Корзина изменилась → обновить счётчик и содержимое корзины
events.on('basket:changed', () => {
    page.counter = basketModel.getCount();
    basketView.render({
        items: buildBasketItems(),
        total: basketModel.getTotalPrice(),
    });
});

// Клик по иконке корзины → открыть модалку с корзиной
events.on('basket:open', () => {
    basketView.render({
        items: buildBasketItems(),
        total: basketModel.getTotalPrice(),
    });
    modal.render({ content: basketView.element });
});

// Удаление товара из корзины
events.on('basket:item-remove', ({ id }: { id: string }) => {
    const item = productsModel.getItemById(id);
    if (item) basketModel.removeItem(item);
});

// Кнопка «Оформить» → открыть форму оплаты (шаг 1)
events.on('basket:checkout', () => {
    modal.render({
        content: orderPayView.render({
            payment: buyerModel.getData().payment,
            valid: false,
            errors: '',
        }),
    });
});

// Выбор способа оплаты
events.on('payment:select', ({ payment }: { payment: TPayment }) => {
    buyerModel.setField('payment', payment);
});

// Изменение полей формы оплаты/адреса (шаг 1)
events.on('order:change', ({ field, value }: { field: keyof IBuyer; value: string }) => {
    buyerModel.setField(field, value);
});

// Изменение полей формы контактов (шаг 2)
events.on('contacts:change', ({ field, value }: { field: keyof IBuyer; value: string }) => {
    buyerModel.setField(field, value);
});

// Данные покупателя изменились → обновить состояние обеих форм
events.on('buyer:changed', () => {
    const errors = buyerModel.validate();
    const data   = buyerModel.getData();

    orderPayView.render({
        payment: data.payment,
        valid: !errors.payment && !errors.address,
        errors: [errors.payment, errors.address].filter(Boolean).join('; '),
    });

    contactsView.render({
        valid: !errors.email && !errors.phone,
        errors: [errors.email, errors.phone].filter(Boolean).join('; '),
    });
});

// Форма оплаты отправлена (Далее) → открыть форму контактов (шаг 2)
events.on('order:submit', () => {
    modal.render({
        content: contactsView.render({
            valid: false,
            errors: '',
        }),
    });
});

// Форма контактов отправлена (Оплатить) → отправить заказ на сервер
events.on('contacts:submit', () => {
    const data  = buyerModel.getData();
    const order = {
        payment: data.payment as TPayment,
        email: data.email,
        phone: data.phone,
        address: data.address,
        items: basketModel.getItems().map((i) => i.id),
        total: basketModel.getTotalPrice(),
    };

    larekApi
        .createOrder(order)
        .then((result) => {
            modal.render({ content: successView.render({ total: result.total }) });
            basketModel.clear();
            buyerModel.clear();
        })
        .catch((err) => console.error('Ошибка оформления заказа:', err));
});

// Экран успеха закрыт
events.on('success:close', () => {
    modal.close();
});

// ── Загрузка данных с сервера ──────────────────────────────────────────────────
larekApi
    .getProducts()
    .then((response) => productsModel.setItems(response.items))
    .catch((err) => console.error('Ошибка загрузки каталога:', err));
