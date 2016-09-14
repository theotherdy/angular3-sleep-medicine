import { Component, Input, OnInit } from '@angular/core';

import { FaComponent } from 'angular2-fontawesome/components';

import { CollapseDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { Observable }     from 'rxjs/Observable';

import { Week } from './week';
import { LectureTypePipe } from './lecture-type.pipe';
import { DescriptionFormatterPipe } from './description-formatter.pipe';
import { WeekService } from './week.service';

import { ModyuleResourceComponent } from './modyule-resource.component';

@Component({
    moduleId: module.id,
    selector: 'week-detail-component',
    templateUrl: 'week-detail.component.html',
    directives: [ModyuleResourceComponent,FaComponent,ACCORDION_DIRECTIVES,CollapseDirective],
    styleUrls:  ['week-detail.component.css'],
    pipes: [LectureTypePipe, DescriptionFormatterPipe],
    providers: [WeekService]
})

export class WeekDetailComponent implements OnInit {
    @Input()
    week: Week;
    lecturesObservable: Observable<Week>;

    error: any;
    errorMessage: string;

    public isCollapsed:boolean = true;

    constructor(
        private weekService: WeekService) {
    }

    ngOnInit() {
        this.lecturesObservable = this.weekService.getWeekLesson(this.week)
            .map(week => {
                this.week.lectures = week.lectures;
                this.week.seminars = week.seminars;
                //console.log(week);
                return week;
            })
            .switchMap(week => this.weekService.getLecturesDetails(this.week))
            .map(week => {
                this.week.lectures = week.lectures;
                return week;
            })
            .switchMap(week => this.weekService.getSeminarsDetails(this.week))
            .map(week => {
                this.week.seminars = week.seminars;
                return week;
            });
            /*.subscribe(
                week => {
                    this.week.lectures = week.lectures;
                    },
                error =>  this.errorMessage = <any>error
            );*/
    }
}
