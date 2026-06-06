import './scss/styles.scss';

import { Api } from './components/base/Api';
import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { LarekApi } from './components/LarekApi';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';

// -------------------------------------------------------
// Создаём экземпляры всех трёх моделей данных
// -------------------------------------------------------
const productsModel = new Products();
const basketModel = new Basket();
const buyerModel = new Buyer();

// -------------------------------------------------------
// Тестирование модели Products (каталог товаров)
// -------------------------------------------------------
productsModel.setItems(apiProducts.items);
console.log('=== Products ===');
console.log('Все товары:', productsModel.getItems());
console.log('Товар по id:', productsModel.getItemById('854cef69-976d-4c2a-a18c-2aa45046c390'));

const firstItem = productsModel.getItems()[0];
productsModel.setPreview(firstItem);
console.log('Товар для просмотра:', productsModel.getPreview());

// -------------------------------------------------------
// Тестирование модели Basket (корзина)
// -------------------------------------------------------
const item1 = productsModel.getItems()[0];
const item2 = productsModel.getItems()[1];

basketModel.addItem(item1);
basketModel.addItem(item2);

console.log('=== Basket ===');
console.log('Товары в корзине:', basketModel.getItems());
console.log('Количество товаров:', basketModel.getCount());
console.log('Итоговая стоимость:', basketModel.getTotalPrice());
console.log('Товар есть в корзине?', basketModel.hasItem(item1.id));

basketModel.removeItem(item1);
console.log('После удаления первого товара:', basketModel.getItems());

basketModel.clear();
console.log('После очистки корзины:', basketModel.getItems());

// -------------------------------------------------------
// Тестирование модели Buyer (покупатель)
// -------------------------------------------------------
console.log('=== Buyer ===');
console.log('Валидация пустого покупателя:', buyerModel.validate());

buyerModel.setField('payment', 'card');
buyerModel.setField('address', 'ул. Пушкина, д. 1');
buyerModel.setField('email', 'ivan@example.com');
buyerModel.setField('phone', '+79991234567');

console.log('Данные покупателя:', buyerModel.getData());
console.log('Валидация заполненного покупателя (ошибок нет):', buyerModel.validate());

buyerModel.clear();
console.log('После очистки данных покупателя:', buyerModel.getData());

// -------------------------------------------------------
// Запрос к серверу — получаем реальный каталог товаров
// -------------------------------------------------------
const api = new Api(API_URL);
const larekApi = new LarekApi(api);

larekApi.getProducts()
    .then((response) => {
        productsModel.setItems(response.items);
        console.log('=== Каталог с сервера ===');
        console.log('Товаров получено:', response.total);
        console.log('Сохранённый каталог:', productsModel.getItems());
    })
    .catch((err) => {
        console.error('Ошибка при загрузке каталога:', err);
    });
