import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { ISuccessView } from '../../types/index';

export class Success extends Component<ISuccessView> {
    protected _description: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this._description = ensureElement<HTMLElement>('.order-success__description', container);
        this._button = ensureElement<HTMLButtonElement>('.order-success__close', container);

        this._button.addEventListener('click', () => {
            events.emit('success:close');
        });
    }

    set total(value: number) {
        this.setText(this._description, `Списано ${value} синапсов`);
    }
}
