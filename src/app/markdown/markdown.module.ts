import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownViewerComponent } from './markdown-viewer/markdown-viewer.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
      MarkdownViewerComponent
  ],
  exports: [
      MarkdownViewerComponent
  ]
})
export class MarkdownModule { }
