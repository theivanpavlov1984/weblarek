import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IFormState } from '../../types/index';

export class Form<T extends IFormState> extends Component<T> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);
        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', container);
        this._errors = ensureElement<HTMLElement>('.form__errors', container);

        container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name;
            const value = target.value;
            this.onInputChange(field, value);
        });

        container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onInputChange(field: string, value: string): void {
        this.events.emit(`${this.container.name}:change`, { field, value });
    }

    set valid(value: boolean) {
        this.setDisabled(this._submit, !value);
    }

    set errors(value: string) {
        this.setText(this._errors, value);
    }
}
