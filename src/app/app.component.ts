/** @format */

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

interface Daylik {
	state: 'idle' | 'pending' | 'live' | 'done';
}

interface DaylikSettingsForm {
	timer: FormControl<string>;
	timerHurry: FormControl<number>;
	fireworks: FormControl<boolean>;
}

interface Team {
	teamName: string;
	teamMemberList: TeamMember[];
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
	@ViewChild('daylikSettingsModal') daylikSettingsModal: ElementRef<HTMLDialogElement> | undefined;

	@ViewChild('fireworks') fireworks?: FireworksDirective;

	daylik: Daylik = {
		state: 'idle'
	};
	daylikTime: string | undefined;
	daylikSettingsForm: FormGroup<DaylikSettingsForm>;

	team!: Team;

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

	setTeam(): void {
		this.httpClient.get<Team>('assets/team.json').subscribe({
			next: (team: Team) => {
				/** Set ids, set default state */

				// prettier-ignore
				team.teamMemberList = team.teamMemberList
          .filter((teamMember: TeamMember) => !teamMember.absent)
          .map((teamMember: TeamMember, i: number) => {
            return {
              ...teamMember,
              id: i,
              state: 'idle'
            };
        });

				this.team = team;

				// TODO: Debug
				// this.team.teamMemberList = team.teamMemberList.splice(0, 1);
			},
			error: (error: any) => console.log(error)
		});
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

	onDaylikChangeState(): void {
		switch (this.daylik.state) {
			case 'idle': {
				this.daylik.state = 'pending';

				break;
			}
			case 'pending': {
				this.daylik.state = 'live';

				this.team.teamMemberList.forEach((teamMember: TeamMember) => {
					teamMember.state = 'pending';
				});
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
}
