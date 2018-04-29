import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { MarkdownModule } from '../markdown/markdown.module';
import { HttpClientModule } from '@angular/common/http';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogService } from './services/blog.service';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NavigateDirective } from './directives/navigate.directive';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        HttpClientModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        BlogService
    ],
    declarations: [
        BlogPostComponent,
        BlogListComponent,
        NavigateDirective
    ],
    exports: [
        BlogPostComponent
    ]
})
export class BlogModule { }
