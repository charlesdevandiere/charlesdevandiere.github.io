import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { environment } from '../../../environments/environment';
import { Post } from '../models/post.model';
import { Title, Meta } from '@angular/platform-browser';
import { TagContentType } from '@angular/compiler';

@Component({
    selector: 'app-blog-post',
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit, OnDestroy {
    private unsubscriber$: Subject<boolean> = new Subject<boolean>();

    name = environment.name;
    githubUrl = environment.githubUrl;
    twitterUrl = environment.twitterUrl;
    linkedInUrl = environment.linkedInUrl;
    post: Post;
    markdown: string;

    constructor(
        private route: ActivatedRoute,
        private titleService: Title,
        private metaService: Meta,
        private blogService: BlogService) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        this.blogService.getBlogPostById(id)
            .takeUntil(this.unsubscriber$)
            .subscribe(post => {
                this.post = post;
                this.titleService.setTitle(`${post.title} - Blog - ${environment.name}`);
                this.metaService.addTag({ name: 'keywords', content: this.post.tags.join() });
            });
        this.blogService.getBlogPostText(id)
            .takeUntil(this.unsubscriber$)
            .subscribe(text => this.markdown = text);
    }

    ngOnDestroy(): void {
        this.unsubscriber$.next(true);
        this.unsubscriber$.unsubscribe();
    }
}
