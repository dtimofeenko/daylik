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
      name: 'Серёжа'
    },
    {
      name: 'Алёна'
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

  daylikIsStarted: boolean = false;
  daylikTime: any;

  ngOnInit(): void {
    this.memberTeamList = this.memberTeamList.map((memberTeam: any, i: number) => {
      return {
        ...memberTeam,
        id: i,
        state: 'idle'
      }
    });

    this.setTime();
  }

  setTime(): void {
    let date: Date = new Date();
    let hh: string | number = date.getHours();
    let mm: string | number = date.getMinutes();
    let ss: string | number = date.getSeconds();
    let session: string = "AM";

    if (hh === 0) {
      hh = 12;
    }

    if (hh > 12) {
      hh = hh - 12;
      session = "PM";
    }

    hh = (hh < 10) ? "0" + hh : hh;
    mm = (mm < 10) ? "0" + mm : mm;
    ss = (ss < 10) ? "0" + ss : ss;

    this.daylikTime = hh + ":" + mm + ":" + ss + " " + session;

    let t: any = setTimeout(() => {
      this.setTime()
    }, 1000);
  };

  onShuffle(): void {
    this.memberTeamList.sort(() => Math.random() - 0.5);
  }

  onStart(): void {
    this.daylikIsStarted = true;

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
