## Introduction

Enim est eu minim incididunt enim. Sint pariatur commodo Lorem labore ut incididunt aliqua in eiusmod excepteur tempor. Ex proident est tempor reprehenderit laborum eiusmod aute officia nostrud qui mollit ut minim. Ea fugiat adipisicing nulla proident proident. Pariatur aliqua occaecat esse minim exercitation incididunt aliquip proident eiusmod nulla voluptate cupidatat. Qui dolor aliquip non quis.

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
