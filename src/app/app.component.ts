import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  memberTeamList: any[] = [
    {
      name: 'Стас'
    },
    {
      name: 'Денис'
    },
    {
      name: 'Дима'
    },
    {
      name: 'Ирина'
    },
    {
      name: 'Данила'
    },
    {
      name: 'Сережа'
    },
    {
      name: 'Алена'
    },
    {
      name: 'Рома'
    },
    {
      name: 'Алина'
    },
    {
      name: 'Егор'
    },
    {
      name: 'Ярослав'
    },
    {
      name: 'Владислав'
    },
    {
      name: 'Лиля'
    },
    {
      name: 'Диана'
    },
    {
      name: 'Lil Александр'
    },
    {
      name: 'Lil Андрей'
    },
    {
      name: 'Владимир'
    },
    {
      name: 'Сергей'
    },
  ];
  memberTeamListBackground: any = {
    idle: 'bg-sky-400',
    ready: 'bg-rose-400'
  }

  ngOnInit(): void {
    this.memberTeamList = this.memberTeamList.map((memberTeam: any, i: number) => {
      return {
        ...memberTeam,
        id: i,
        state: 'idle'
      }
    });
  }

  onShuffle(): void {
    this.memberTeamList.sort(() => Math.random() - 0.5);
  }

  onStart(): void {
    this.memberTeamList = this.memberTeamList.map((memberTeam: any, i: number) => {
      return {
        ...memberTeam,
        state: 'ready'
      }
    });
  }

  onLive(memberTeam: any): void {
    switch (memberTeam.state) {
      case 'ready': {
        memberTeam.state = 'idle'
        break;
      }
      default: {
        break;
      }
    }
  }

  onRemove(memberTeam: any): void {
    this.memberTeamList = this.memberTeamList.filter((memberTeamListItem) => memberTeamListItem.id !== memberTeam.id);
  }
}
