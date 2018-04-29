import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import { environment } from '../../../environments/environment';
import { Post } from '../models/post.model';
import { BlogService } from '../services/blog.service';

@Component({
    selector: 'app-blog-list',
    templateUrl: './blog-list.component.html',
    styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit, OnDestroy {
    private unsubscriber$: Subject<boolean> = new Subject<boolean>();
    private _posts: Post[];

    name = environment.name;
    posts: Post[];
    isSearchExpanded = false;
    isFiltersExpanded = false;
    filterCount: number;
    filterForm: FormGroup;
    categories: string[] = [];
    tags: string[] = [];

    constructor(
        private titleService: Title,
        private blogService: BlogService,
        private formBuilder: FormBuilder) {
        this.filterForm = this.formBuilder.group({
            search: '',
            category: '',
            tag: ''
        });
    }

    ngOnInit(): void {
        this.titleService.setTitle(`Blog - ${environment.name}`);

        this.blogService.getBlogPosts()
            .takeUntil(this.unsubscriber$)
            .subscribe(posts => {
                this._posts = posts.sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime());
                this.posts = this._posts;
                this.posts.forEach(post => {
                    if (this.categories.indexOf(post.category) === -1) {
                        this.categories.push(post.category);
                    }
                    post.tags.forEach(tag => {
                        if (this.tags.indexOf(tag) === -1) {
                            this.tags.push(tag);
                        }
                    });
                });
            });

        this.filterForm.valueChanges
            .debounceTime(200)
            .takeUntil(this.unsubscriber$)
            .subscribe(filters => {
                this.calculateFilterCount(filters);
                this.filter(filters);
            });
    }

    toggleExpandSearch(): void {
        this.isSearchExpanded = !this.isSearchExpanded;
    }

    toggleExpandFilters(): void {
        this.isFiltersExpanded = !this.isFiltersExpanded;
    }

    private calculateFilterCount(filters: { category: string, tag: string }): void {
        this.filterCount = 0;
        if (filters.category) {
            this.filterCount++;
        }
        if (filters.tag) {
            this.filterCount++;
        }
    }

    private filter(filters: { search: string, category: string, tag: string }): void {
        let filteredPosts: Post[] = this._posts;
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filteredPosts = filteredPosts.filter(post => post.title.toLowerCase().includes(search));
        }
        if (filters.category) {
            filteredPosts = filteredPosts.filter(post => post.category === filters.category);
        }
        if (filters.tag) {
            filteredPosts = filteredPosts.filter(post => post.tags.indexOf(filters.tag) >= 0);
        }

        this.posts = filteredPosts;
    }

    ngOnDestroy(): void {
        this.unsubscriber$.next(true);
        this.unsubscriber$.unsubscribe();
    }
}
