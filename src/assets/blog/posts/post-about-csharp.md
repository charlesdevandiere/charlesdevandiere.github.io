## Introduction

Velit in enim ipsum consectetur est non et do ex quis magna Lorem sit. Nisi ea proident in eiusmod incididunt eu. Ut enim amet eu aute ea in elit consectetur incididunt incididunt. Irure enim sit ex sunt laboris id. Pariatur magna sit ipsum do esse tempor commodo et duis veniam dolore minim magna cillum. Ullamco quis occaecat ipsum ut velit labore Lorem enim in. Dolore ipsum culpa occaecat proident nulla deserunt consequat fugiat aliquip ea elit irure.

``` js
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Remarkable from 'remarkable';
import { HttpClient } from '@angular/common/http';
import * as hljs from 'highlightjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

@Component({
    selector: 'app-markdown-viewer',
    templateUrl: './markdown-viewer.component.html',
    styleUrls: ['./markdown-viewer.component.css']
})
export class MarkdownViewerComponent implements OnInit, OnDestroy {
    private unsubscriber$: Subject<boolean> = new Subject<boolean>();
    markdown: string;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        const md = new Remarkable({
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
            }
        });
        this.http.get('assets/test.md', { responseType: 'text' })
            .takeUntil(this.unsubscriber$)
            .subscribe(text => {
                this.markdown = md.render(text);
            });
    }

    ngOnDestroy(): void {
        this.unsubscriber$.next(true);
        this.unsubscriber$.unsubscribe();
    }
}
```
