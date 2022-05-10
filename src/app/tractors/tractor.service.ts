import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Tractor } from './tractor.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TractorsService {
  private tractors: Tractor[] = [];
  private tractorsUpdated = new Subject<Tractor[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getTractors() {
    this.http
      .get<{ message: string; tractors: Tractor[] }>(
        'http://localhost:3000/api/tractors'
      )
      .subscribe((tractorData) => {
        this.tractors = tractorData.tractors;
        this.tractorsUpdated.next([...this.tractors]);
      });
  }

  getTractorUpdateListener() {
    return this.tractorsUpdated.asObservable();
  }

  getTractor(id: string) {
    return this.http.get<{
      _id: string;
      name: string;
      description: string;
      imagePath: string;
    }>(`http://localhost:3000/api/tractors/${id}`);
  }

  addTractor(name: string, description: string, image: File) {
    const tractorData = new FormData();
    tractorData.append('name', name);
    tractorData.append('description', description);
    if (image) {
      tractorData.append('image', image, name);
    }
    this.http
      .post<{ message: string; tractor: Tractor }>(
        'http://localhost:3000/api/tractors',
        tractorData
      )
      .subscribe((responseData) => {
        const tractor: Tractor = {
          _id: responseData.tractor._id,
          name: name,
          description: description,
          imagePath: responseData.tractor.imagePath,
        };
        const id = responseData.tractor._id;
        tractor._id = id;
        this.tractors.push(tractor);
        this.tractorsUpdated.next([...this.tractors]);
        this.router.navigate(['/']);
      });
  }

  updateTractor(
    _id: string,
    name: string,
    description: string,
    image: File | string
  ) {
    let tractorData: Tractor | FormData;
    if (typeof image === 'object') {
      tractorData = new FormData();
      tractorData.append('id', _id);
      tractorData.append('name', name);
      tractorData.append('description', description);
      tractorData.append('image', image, name);
    } else {
      tractorData = {
        _id: _id,
        name: name,
        description: description,
        imagePath: image,
      };
    }
    this.http
      .put(`http://localhost:3000/api/tractors/${_id}`, tractorData)
      .subscribe((response) => {
        const updatedTractors = [...this.tractors];
        const oldTractorsIndex = updatedTractors.findIndex(
          (tractor) => tractor._id === _id
        );
        const tractor: Tractor = {
          _id: _id,
          name: name,
          description: description,
          imagePath: '',
        };
        updatedTractors[oldTractorsIndex] = tractor;
        this.tractors = updatedTractors;
        this.tractorsUpdated.next([...this.tractors]);
        this.router.navigate(['/']);
      });
  }

  deleteTractor(tractorId: string) {
    this.http
      .delete(`http://localhost:3000/api/tractors/${tractorId}`)
      .subscribe(() => {
        const updatedTractors = this.tractors.filter(
          (tractor) => tractor._id !== tractorId
        );
        this.tractors = updatedTractors;
        this.tractorsUpdated.next([...this.tractors]);
      });
  }
}
