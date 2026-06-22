import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { LarekApi } from './components/LarekApi';

import { Header } from './components/View/Header';
import { Gallery } from './components/View/Gallery';
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
import { IBuyer, IProduct, TPayment } from './types/index';

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

// ── View instances (создаются однократно) ──────────────────────────────────────
const header       = new Header(ensureElement<HTMLElement>('.header'), events);
const gallery      = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal        = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const cardPreview  = new CardPreview(cloneTemplate(cardPreviewTpl), events);
const basketView   = new BasketView(cloneTemplate(basketTpl), events);
const orderPayView = new OrderPayment(cloneTemplate<HTMLFormElement>(orderTpl), events);
const contactsView = new OrderContacts(cloneTemplate<HTMLFormElement>(contactsTpl), events);
const successView  = new Success(cloneTemplate(successTpl), events);

// ── Presenter: обработчики событий ────────────────────────────────────────────

// Каталог обновился → пересоздать карточки галереи (их создаём заново)
events.on('catalog:changed', () => {
    const cards = productsModel.getItems().map((item) => {
        const card = new CardCatalog(cloneTemplate(cardCatalogTpl), {
            onClick: () => events.emit('card:select', item),
        });
        return card.render({
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            price: item.price,
        });
    });
    gallery.render({ catalog: cards });
});

// Клик по карточке каталога → сохранить товар в превью
events.on('card:select', (item: IProduct) => {
    productsModel.setPreview(item);
});

// Превью изменилось → наполнить статичную карточку и показать в модалке
events.on('preview:changed', () => {
    const item = productsModel.getPreview();
    if (!item) return;

    const unavailable = item.price === null;
    const inBasket = basketModel.hasItem(item.id);

    modal.render({
        content: cardPreview.render({
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            price: item.price,
            description: item.description,
            buttonText: unavailable
                ? 'Недоступно'
                : inBasket
                    ? 'Удалить из корзины'
                    : 'Купить',
            buttonDisabled: unavailable,
        }),
    });
});

// Клик по кнопке в превью → добавить/удалить текущий товар (логика в презентере)
events.on('card:buy', () => {
    const item = productsModel.getPreview();
    if (!item) return;
    if (basketModel.hasItem(item.id)) {
        basketModel.removeItem(item);
    } else {
        basketModel.addItem(item);
    }
    modal.close();
});

// Корзина изменилась → обновить счётчик хедера и содержимое корзины
events.on('basket:changed', () => {
    header.render({ counter: basketModel.getCount() });

    const items = basketModel.getItems().map((item, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTpl), {
            onClick: () => events.emit('basket:item-remove', item),
        });
        return card.render({
            index: index + 1,
            title: item.title,
            price: item.price,
        });
    });

    basketView.render({ items, total: basketModel.getTotalPrice() });
});

// Клик по иконке корзины → показать актуальное состояние (пустой рендер)
events.on('basket:open', () => {
    modal.render({ content: basketView.render() });
});

// Удаление товара из корзины
events.on('basket:item-remove', (item: IProduct) => {
    basketModel.removeItem(item);
});

// Кнопка «Оформить» → показать форму оплаты (пустой рендер)
events.on('basket:checkout', () => {
    modal.render({ content: orderPayView.render() });
});

// Выбор способа оплаты
events.on('payment:select', ({ payment }: { payment: TPayment }) => {
    buyerModel.setField('payment', payment);
});

// Изменение полей форм → пишем в модель
events.on('order:change', ({ field, value }: { field: keyof IBuyer; value: string }) => {
    buyerModel.setField(field, value);
});

events.on('contacts:change', ({ field, value }: { field: keyof IBuyer; value: string }) => {
    buyerModel.setField(field, value);
});

// Данные покупателя изменились → обновить обе формы (значения, валидность, ошибки)
events.on('buyer:changed', () => {
    const errors = buyerModel.validate();
    const data   = buyerModel.getData();

    orderPayView.render({
        payment: data.payment,
        address: data.address,
        valid: !errors.payment && !errors.address,
        errors: [errors.payment, errors.address].filter(Boolean).join('; '),
    });

    contactsView.render({
        email: data.email,
        phone: data.phone,
        valid: !errors.email && !errors.phone,
        errors: [errors.email, errors.phone].filter(Boolean).join('; '),
    });
});

// Форма оплаты отправлена (Далее) → показать форму контактов (пустой рендер)
events.on('order:submit', () => {
    modal.render({ content: contactsView.render() });
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

// ── Начальное состояние представлений ──────────────────────────────────────────
basketView.render({ items: [], total: 0 });
orderPayView.render({ payment: null, address: '', valid: false, errors: '' });
contactsView.render({ email: '', phone: '', valid: false, errors: '' });

// ── Загрузка данных с сервера ──────────────────────────────────────────────────
larekApi
    .getProducts()
    .then((response) => productsModel.setItems(response.items))
    .catch((err) => console.error('Ошибка загрузки каталога:', err));
