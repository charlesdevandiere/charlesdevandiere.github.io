import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
import { Post } from '../models/post.model';
import { BlogStorage } from '../models/blog-storage.model';
import 'rxjs/add/operator/map';

@Injectable()
export class BlogService {
    private storage$: BehaviorSubject<BlogStorage> = new BehaviorSubject<BlogStorage>(null);

    private postUrl = (id: string) => `${environment.postsPath}/${id}${environment.postExtension}`;
    private blogStorageUrl = () => `${environment.blogStoragePath}/${environment.blogStorageFileName}`;

    constructor(private http: HttpClient) { }

    getBlogPosts(): Observable<Post[]> {
        return this.getBlogStorage().map(storage => storage.posts);
    }

    getBlogPostById(id: string): Observable<Post> {
        let observable;
        if (this.storage$.value) {
            observable = this.storage$.asObservable();
        } else {
            observable = this.getBlogStorage();
        }

        return observable.map(storage => {
            return storage.posts.find(post => post.id === id);
        });
    }

    getBlogPostText(id: string): Observable<string> {
        return this.http.get(this.postUrl(id), { responseType: 'text' });
    }

    private getBlogStorage(): Observable<BlogStorage> {
        return this.http.get<BlogStorage>(this.blogStorageUrl());
    }
}
