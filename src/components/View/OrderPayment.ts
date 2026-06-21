import { Form } from './Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IOrderPaymentView, TPayment } from '../../types/index';

export class OrderPayment extends Form<IOrderPaymentView> {
    protected _cardButton: HTMLButtonElement;
    protected _cashButton: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._cardButton = ensureElement<HTMLButtonElement>('button[name=card]', container);
        this._cashButton = ensureElement<HTMLButtonElement>('button[name=cash]', container);

        this._cardButton.addEventListener('click', () => {
            events.emit('payment:select', { payment: 'card' });
        });

        this._cashButton.addEventListener('click', () => {
            events.emit('payment:select', { payment: 'cash' });
        });
    }

    set payment(value: TPayment | null) {
        this.toggleClass(this._cardButton, 'button_alt-active', value === 'card');
        this.toggleClass(this._cashButton, 'button_alt-active', value === 'cash');
    }
}
