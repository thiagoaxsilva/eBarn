import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TractorCreateComponent } from './tractors/tractor-create/tractor-create.component';
import { TractorListComponent } from './tractors/tractor-list/tractor-list.component';

const routes: Routes = [
  { path: '', component: TractorListComponent },
  { path: 'criar', component: TractorCreateComponent },
  { path: 'edit/:tractorId', component: TractorCreateComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
