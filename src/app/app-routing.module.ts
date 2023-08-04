/** @format */

import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		title: 'Daylik',
		loadComponent: () => {
			return import('./app.component').then(m => m.AppComponent);
		}
	}
];
