import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Config } from '../../config/config';
import { BranchOpenHoursValidator } from '../../util/branch-open-hours-validator'
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

declare var MobileTicketAPI: any;

@Component({
  selector: 'app-branch-open-hours',
  templateUrl: './branch-open-hours-tmpl.html',
  styleUrls: ['./branch-open-hours.component.css']
})

export class BranchOpenHoursComponent {

  private subscriptions : Subscription[] = [];

  public openHours;
  public branchSchedule = false;
  public replacementHTML = null;

  constructor(private config: Config, public translate: TranslateService,
    private router: Router, private openHourValidator: BranchOpenHoursValidator) {
  }

  ngOnInit() {
    let config = this.config.getConfig('branch_open_hours');

    this.branchSchedule = this.config.getConfig('branch_schedule') === 'enable' ? true : false;

    if (this.openHourValidator.openHoursValid() && !this.branchSchedule) {
      this.router.navigate(['branches']);
    }

    this.subscriptions.push(
      this.translate.stream('open_hours.closed_replacement').subscribe((val) => this.replacementHTML = val)
    );


    this.openHours = [];

    if (config !== null) {
      for (let i = 0; i < config.length; i++) {
        let element = config[i];
        let openHour = (document.dir === 'rtl') ?
          element.display_to + '-' + element.display_from : element.display_from + '-' + element.display_to;

        // hide elements from message
        if (!('show' in element) || element.show !== 'true') {
          continue;
        }

        if (element.display_from === '' || element.display_to === '') {
          this.translate.get('open_hours.closed').subscribe((res: string) => {
            this.openHours.push({
              'day': element.translation_key,
              'fromAndTo': res
            })
          });
        } else {
          this.openHours.push({
            'day': element.translation_key,
            'fromAndTo': openHour
          })
        }
      };
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(
      sub => sub.unsubscribe()
    );
    this.subscriptions = [];
  }

}
