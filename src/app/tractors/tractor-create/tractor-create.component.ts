import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Tractor } from '../tractor.model';

import { TractorsService } from '../tractor.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-tractor-create',
  templateUrl: './tractor-create.component.html',
  styleUrls: ['./tractor-create.component.css'],
})
export class TractorCreateComponent implements OnInit {
  enteredName = '';
  enteredDescription = '';
  private mode = 'create';
  private tractorId: string;
  tractor: Tractor;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;

  constructor(
    public tractorsService: TractorsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      description: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [],
        asyncValidators: [mimeType],
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('tractorId')) {
        this.mode = 'edit';
        this.tractorId = paramMap.get('tractorId');
        this.isLoading = true;
        this.tractorsService
          .getTractor(this.tractorId)
          .subscribe((tractorData) => {
            this.isLoading = false;
            this.tractor = {
              _id: tractorData._id,
              name: tractorData.name,
              description: tractorData.description,
              imagePath: tractorData.imagePath,
            };
            this.form.setValue({
              name: this.tractor.name,
              description: this.tractor.description,
              image: this.tractor.imagePath,
            });
          });
      } else {
        this.mode = 'create';
        this.tractorId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onAddTractor() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.tractorsService.addTractor(
        this.form.value.name,
        this.form.value.description,
        this.form.value.image
      );
    } else {
      this.tractorsService.updateTractor(
        this.tractorId,
        this.form.value.name,
        this.form.value.description,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}
