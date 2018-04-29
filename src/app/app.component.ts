import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(
        private titleService: Title,
        private metaService: Meta) {
        this.titleService.setTitle(environment.name);
        this.metaService.addTag({ name: 'description', content: 'blog' });
        this.metaService.addTag({ name: 'author', content: environment.name });
    }
}
