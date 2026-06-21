import { Form } from './Form';
import { IEvents } from '../base/Events';
import { IOrderContactsView } from '../../types/index';

export class OrderContacts extends Form<IOrderContactsView> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }
}
