import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tractor } from '../tractor.model';
import { TractorsService } from '../tractor.service';

@Component({
  selector: 'app-tractor-list',
  templateUrl: './tractor-list.component.html',
  styleUrls: ['./tractor-list.component.css'],
})
export class TractorListComponent implements OnInit, OnDestroy {
  tractors: Tractor[] = [];
  private tractorsSub: Subscription | undefined;
  isLoading = false;

  constructor(public tractorsService: TractorsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.tractorsService.getTractors();
    this.tractorsService
      .getTractorUpdateListener()
      .subscribe((tractors: Tractor[]) => {
        this.isLoading = false;
        this.tractors = tractors;
      });
  }

  onDelete(tractorId?: string) {
    if (tractorId) {
      this.tractorsService.deleteTractor(tractorId);
    }
  }
  ngOnDestroy() {
    this.tractorsSub?.unsubscribe();
  }
}
