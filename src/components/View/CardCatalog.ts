import { Card } from './Card';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { categoryMap } from '../../utils/constants';
import { ICardCatalog } from '../../types/index';

export class CardCatalog extends Card<ICardCatalog> {
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);

        container.addEventListener('click', () => {
            events.emit('card:select', { id: this.id });
        });
    }

    set image(value: string) {
        this.setImage(this._image, value, this._title.textContent ?? '');
    }

    set category(value: string) {
        this.setText(this._category, value);
        this._category.className = 'card__category';
        const modifier = categoryMap[value as keyof typeof categoryMap];
        if (modifier) this._category.classList.add(modifier);
    }
}
