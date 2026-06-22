/**
 * Базовый компонент
 */
export abstract class Component<T> {
    protected constructor(protected readonly container: HTMLElement) {
        // Учитывайте что код в конструкторе исполняется ДО всех объявлений в дочернем классе
    }

    // Установить текстовое содержимое элемента
    protected setText(element: HTMLElement, value: string | number): void {
        if (element) {
            element.textContent = String(value);
        }
    }

    // Установить/снять атрибут disabled
    protected setDisabled(element: HTMLElement, state: boolean): void {
        if (element) {
            if (state) element.setAttribute('disabled', 'disabled');
            else element.removeAttribute('disabled');
        }
    }

    // Переключить CSS-класс
    protected toggleClass(element: HTMLElement, className: string, force?: boolean): void {
        if (element) {
            element.classList.toggle(className, force);
        }
    }

    // Установить изображение с альтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string): void {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    // Применить данные через сеттеры и вернуть корневой DOM-элемент
    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}
