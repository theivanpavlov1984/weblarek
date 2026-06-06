import { IApi, IProductsResponse, IOrderRequest, IOrderResponse } from '../types/index';

export class LarekApi {
    protected _api: IApi;

    constructor(api: IApi) {
        this._api = api;
    }

    getProducts(): Promise<IProductsResponse> {
        return this._api.get<IProductsResponse>('/product/');
    }

    createOrder(order: IOrderRequest): Promise<IOrderResponse> {
        return this._api.post<IOrderResponse>('/order/', order);
    }
}
