import { Component, OnInit, Input } from '@angular/core';
import * as Remarkable from 'remarkable';
import * as hljs from 'highlightjs';

@Component({
    selector: 'app-markdown-viewer',
    templateUrl: './markdown-viewer.component.html',
    styleUrls: ['./markdown-viewer.component.scss']
})
export class MarkdownViewerComponent {
    private remarkable: Remarkable;
    html: string;

    @Input()
    set markdown(value: string) {
        this.html = this.remarkable.render(value);
    }

    constructor() {
        this.remarkable = new Remarkable({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value;
                    } catch (err) { }
                }

                try {
                    return hljs.highlightAuto(str).value;
                } catch (err) { }

                return '';
            },
            linkify: true,
            typographer: true
        });
    }
}
