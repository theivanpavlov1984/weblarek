import { IBuyer, IBuyerModel, TPayment, TBuyerValidationErrors } from '../../types/index';

export class Buyer implements IBuyerModel {
    protected _payment: TPayment | '' = '';
    protected _address: string = '';
    protected _phone: string = '';
    protected _email: string = '';

    setField(field: keyof IBuyer, value: string): void {
        switch (field) {
            case 'payment':
                this._payment = value as TPayment;
                break;
            case 'address':
                this._address = value;
                break;
            case 'phone':
                this._phone = value;
                break;
            case 'email':
                this._email = value;
                break;
        }
    }

    getData(): IBuyer {
        return {
            payment: this._payment as TPayment,
            address: this._address,
            phone: this._phone,
            email: this._email,
        };
    }

    clear(): void {
        this._payment = '';
        this._address = '';
        this._phone = '';
        this._email = '';
    }

    validate(): TBuyerValidationErrors {
        const errors: TBuyerValidationErrors = {};

        if (!this._payment) {
            errors.payment = 'Не выбран вид оплаты';
        }
        if (!this._address) {
            errors.address = 'Укажите адрес доставки';
        }
        if (!this._email) {
            errors.email = 'Укажите email';
        }
        if (!this._phone) {
            errors.phone = 'Укажите телефон';
        }

        return errors;
    }
}
