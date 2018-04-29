import { Directive, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
    selector: '[appNavigate]'
})
export class NavigateDirective {

    @Input()
    route: string;

    @Input()
    extras: any = {};

    @HostListener('click')
    onClick(): void {
        this.router.navigate([this.route], this.extras);
    }

    constructor(private router: Router) { }
}
