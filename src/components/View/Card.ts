import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { ICard } from '../../types/index';

export class Card<T extends ICard = ICard> extends Component<T> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number | null) {
        this.setText(this._price, value !== null ? `${value} синапсов` : 'Бесценно');
    }
}
