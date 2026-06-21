import { Card } from './Card';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { ICardBasket } from '../../types/index';

export class CardBasket extends Card<ICardBasket> {
    protected _index: HTMLElement;
    protected _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

        this._deleteButton.addEventListener('click', () => {
            events.emit('basket:item-remove', { id: this.id });
        });
    }

    set index(value: number) {
        this.setText(this._index, String(value));
    }
}
