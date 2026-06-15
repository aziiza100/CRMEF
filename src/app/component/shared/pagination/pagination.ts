import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() maxPagesToShow: number = 5;

  @Output() pageChange = new EventEmitter<number>();

  totalPages: number = 0;
  visiblePages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePages();
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  calculatePages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Ensure currentPage is within bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.pageChange.emit(this.currentPage);
    }

    const pages: number[] = [];
    let start = Math.max(1, this.currentPage - Math.floor(this.maxPagesToShow / 2));
    let end = Math.min(this.totalPages, start + this.maxPagesToShow - 1);

    if (end - start + 1 < this.maxPagesToShow) {
      start = Math.max(1, end - this.maxPagesToShow + 1);
    }

    start = Math.max(1, start);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    this.visiblePages = pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }
}
