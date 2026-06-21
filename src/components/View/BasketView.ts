import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement, createElement } from '../../utils/utils';
import { IBasketView } from '../../types/index';

export class BasketView extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);

        this._button.addEventListener('click', () => {
            events.emit('basket:checkout');
        });
    }

    set items(value: HTMLElement[]) {
        if (value.length === 0) {
            this._list.replaceChildren(
                createElement<HTMLParagraphElement>('p', { textContent: 'Корзина пуста' })
            );
            this.setDisabled(this._button, true);
        } else {
            this._list.replaceChildren(...value);
            this.setDisabled(this._button, false);
        }
    }

    set total(value: number) {
        this.setText(this._total, `${value} синапсов`);
    }
}
