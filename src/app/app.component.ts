/** @format */

import {
	Component,
	ElementRef,
	inject,
	OnInit,
	ViewChild
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import type { FireworksDirective } from '@fireworks-js/angular';
import { NgFireworksModule } from '@fireworks-js/angular';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule
} from '@angular/forms';
import { LocalStorageService } from '../core/local-storage.service';
import { PlatformService } from '../core/platform.service';

interface Daylik {
	state: 'idle' | 'pending' | 'live' | 'done' | 'setup';
}

interface DaylikSettingsForm {
	timer: FormControl<string>;
	timerHurry: FormControl<number>;
	fireworks: FormControl<boolean>;
}

interface Team {
	teamName: string;
	teamMemberList: TeamMember[];
	teamDoneText: string;
	teamDoneImage: string;
}

interface TeamMember {
	id: number;
	name: string;
	image: string | null;
	absent: boolean;
	state: 'idle' | 'pending' | 'live' | 'done';
	department: string;
}

@Component({
	standalone: true,
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [CommonModule, NgFireworksModule, ReactiveFormsModule]
})
export class AppComponent implements OnInit {
	// prettier-ignore
	private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
	private readonly platformService: PlatformService = inject(PlatformService);

	// prettier-ignore
	@ViewChild('daylikSettingsModal') daylikSettingsModal: ElementRef<HTMLDialogElement> | undefined;

	@ViewChild('fireworks') fireworks?: FireworksDirective;

	@ViewChild('preEditable') preEditable?: any;

	daylik: Daylik = {
		state: 'idle'
	};
	daylikTime: string | undefined;
	daylikSettingsForm: FormGroup<DaylikSettingsForm>;

	team!: Team;
	teamSetup!: Team;
	teamSetupRaw!: string;

	t: any;
	t2: any;
	t2Value: number = 0;
	t2Toggle: boolean = false;

	square: number = 180;
	viewBox: string = '0 0 180 180';

	R = 80; // радиус
	P = 502.4; // длина окружности
	P1 = 5.024; // длина 1% окружности

	progress: number = 100; // прогресс в процентах
	progressWidth: number = 4;
	progressColor!: string;

	// длина прогресса (с корректировкой на половину толщины линии)
	progressLength = +(this.P1 * this.progress - +this.progressWidth / 2).toFixed(
		3
	);

	// расстояние между отрезками
	progressOffset = +(this.P - this.progressLength).toFixed(3);

	mapColor!: string;
	mapWidth: string | number = 4;

	// длина + расстояние между отрезками
	strokeDasharray: string = `${this.progressLength} ${this.progressOffset}`;

	// смещение прогресса (чтоб начинался сверху)
	strokeDashoffset: number = +((this.P / 4) * 3 * -1).toFixed(3);

	constructor(
		private httpClient: HttpClient,
		private formBuilder: FormBuilder
	) {
		this.daylikSettingsForm = this.formBuilder.group<DaylikSettingsForm>({
			timer: this.formBuilder.nonNullable.control('no', []),
			timerHurry: this.formBuilder.nonNullable.control(10, []),
			fireworks: this.formBuilder.nonNullable.control(false, [])
		});
	}

	ngOnInit(): void {
		/** Start time */

		this.setTime();

		/** Get team */

		this.setTeam();

		/** Get settings */

		// prettier-ignore
		const daylikSettings: string | null =  window.localStorage.getItem('daylikSettings');

		if (daylikSettings) {
			this.daylikSettingsForm.setValue(JSON.parse(daylikSettings));
		}
	}

	setTime(): void {
		let date: Date = new Date();
		let hh: string | number = date.getHours();
		let mm: string | number = date.getMinutes();
		let ss: string | number = date.getSeconds();
		let session: string = 'AM';

		if (hh === 0) {
			hh = 12;
		}

		if (hh > 12) {
			hh = hh - 12;
			session = 'PM';
		}

		hh = hh < 10 ? '0' + hh : hh;
		mm = mm < 10 ? '0' + mm : mm;
		ss = ss < 10 ? '0' + ss : ss;

		this.daylikTime = hh + ':' + mm + ':' + ss + ' ' + session;

		let t: any = setTimeout(() => this.setTime(), 1000);
	}

	setTimer(): void {
		if (this.progress > 0) {
			if (this.progress - 1.6 / 10 > 0) {
				this.progress = this.progress - 1.6 / 10;
				this.onTeamMemberGetTimer();

				this.t = setTimeout(() => this.setTimer(), 100);
			} else {
				this.progress = 0;
				clearTimeout(this.t);
			}
		} else {
			this.progress = 0;
			clearTimeout(this.t);
		}
	}

	setTimerDaylik(): void {
		this.t2 = setInterval(() => {
			this.t2Value++;
		}, 1000);
	}

	setTeam(): void {
		const teamLocalStorage = (): Team | null => {
			// prettier-ignore
			const team: string | null = this.localStorageService.getItem('daylikTeam');

			if (team) {
				return JSON.parse(team);
			}

			return null;
		};

		const teamSaved: Team | null = teamLocalStorage();

		if (teamSaved) {
			this.teamSetup = teamSaved;
		} else {
			this.httpClient.get<Team>('assets/team.json').subscribe({
				next: (team: Team) => (this.teamSetup = team),
				error: (error: any) => console.log(error)
			});
		}
	}

	setRandom(): void {
		// prettier-ignore
		const teamMemberList: TeamMember[] = this.team.teamMemberList.filter((teamMember: TeamMember) => {
      return teamMember.state === 'pending';
    });

		// prettier-ignore
		const teamMemberRandom: TeamMember = teamMemberList[(teamMemberList.length * Math.random()) | 0];

		if (teamMemberRandom) {
			this.onTeamMemberChangeState(teamMemberRandom);
		} else {
			// prettier-ignore
			const teamMemberLive: TeamMember | undefined = this.team.teamMemberList.find((teamMember: TeamMember) => {
        return teamMember.state === 'live';
      });

			if (teamMemberLive) {
				this.onTeamMemberChangeState(teamMemberLive);
			}
		}
	}

	onTeamMemberListShuffle(): void {
		this.team.teamMemberList.sort(() => Math.random() - 0.5);
	}

	onTeamMemberRemove(teamMember: TeamMember): void {
		// prettier-ignore
		this.team.teamMemberList = this.team.teamMemberList.filter((teamMemberListItem: TeamMember) => {
      return teamMemberListItem.id !== teamMember.id;
    });
	}

	onTeamMemberChangeState(teamMember: TeamMember): void {
		clearTimeout(this.t);

		switch (teamMember.state) {
			case 'pending': {
				// prettier-ignore
				const teamMemberIsLive: TeamMember | undefined = this.team.teamMemberList.find((teamMember: TeamMember) => {
          return teamMember.state === 'live';
        })

				/** Previous live goes to done */

				if (teamMemberIsLive) {
					teamMemberIsLive.state = 'done';
				}

				teamMember.state = 'live';

				if (this.daylikSettingsForm.controls.timer.value === 'yes') {
					this.progress = 100;
					this.setTimer();
				}

				/** Timer turn on! */

				if (
					this.daylikSettingsForm.controls.timer.value === 'in-case-of-hurry'
				) {
					if (
						this.t2Value >
						Number(this.daylikSettingsForm.controls.timerHurry.value) * 60
					) {
						this.progress = 100;
						this.setTimer();

						this.t2Toggle = true;
					}
				}
				break;
			}
			case 'live': {
				teamMember.state = 'done';

				/** Finish Daylik */

				// prettier-ignore
				const daylikIsDone: boolean = this.team.teamMemberList.every((teamMember: TeamMember) => {
          return teamMember.state === 'done';
        });

				if (daylikIsDone) {
					this.daylik.state = 'done';
				}

				break;
			}
			default: {
				break;
			}
		}
	}

	onTeamMemberGetTimer(): void {
		const difference =
			+this.progressWidth > +this.mapWidth
				? +this.progressWidth / 2
				: +this.mapWidth / 2;

		this.R = +this.square / 2 - difference;
		this.P = 2 * Math.PI * this.R;
		this.P1 = this.P / 100;

		this.progressLength = +(
			this.P1 * this.progress -
			+this.progressWidth / 2
		).toFixed(3);
		this.progressOffset = +(this.P - this.progressLength).toFixed(3);

		this.strokeDasharray = `${this.progressLength} ${this.progressOffset}`;
		this.strokeDashoffset = +((this.P / 4) * 3 * -1).toFixed(3);
	}

	onDaylikChangeState(): void {
		switch (this.daylik.state) {
			case 'idle': {
				this.team = this.teamSetup;
				this.team.teamMemberList = this.team.teamMemberList
					.filter((teamMember: TeamMember) => !teamMember.absent)
					.map((teamMember: TeamMember, i: number) => {
						return {
							...teamMember,
							id: i + 1,
							state: 'idle'
						};
					});

				this.daylik.state = 'pending';

				break;
			}
			case 'pending': {
				this.daylik.state = 'live';

				this.team.teamMemberList.forEach((teamMember: TeamMember) => {
					teamMember.state = 'pending';
				});

				this.setTimerDaylik();
				break;
			}

			default: {
				break;
			}
		}
	}

	onDaylikToggleSettings(toggle: boolean): void {
		if (toggle) {
			this.daylikSettingsModal?.nativeElement.showModal();
		} else {
			this.daylikSettingsModal?.nativeElement.close();
		}
	}

	onDaylikSubmitSettings(): void {
		this.onDaylikToggleSettings(false);

		// prettier-ignore
		window.localStorage.setItem('daylikSettings', JSON.stringify(this.daylikSettingsForm.value));
	}

	onDaylikToggleSetup(): void {
		this.daylik.state = 'setup';

		this.teamSetupRaw = JSON.stringify(this.teamSetup, null, 2);
	}

	onDaylikInputSetup(): void {
		this.teamSetupRaw = this.preEditable.nativeElement.innerText;
	}

	onDaylikSaveSetup(): void {
		try {
			const teamSetupRaw: string = this.teamSetupRaw;

			this.teamSetup = JSON.parse(teamSetupRaw);

			this.localStorageService.setItem('daylikTeam', teamSetupRaw);

			this.daylik.state = 'idle';
		} catch (e) {
			if (this.platformService.isBrowser()) {
				const window: Window = this.platformService.getWindow();

				window.alert('Oh no, your JSON malformed and I will not saving it');
			}
		}
	}

	onDaylikResetSetup(): void {
		this.localStorageService.removeItem('daylikTeam');

		this.setTeam();

		setTimeout(() => {
			this.onDaylikInputSetup();
		}, 100);
	}
}
