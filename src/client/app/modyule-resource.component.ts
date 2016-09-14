import { Component, Input, OnInit } from '@angular/core';

import { FaComponent } from 'angular2-fontawesome/components';

import { CollapseDirective } from 'ng2-bootstrap/ng2-bootstrap';

//import {CORE_DIRECTIVES} from '@angular/common';
import { Observable }     from 'rxjs/Observable';

import { LectureTypePipe } from './lecture-type.pipe';
import { DescriptionFormatterPipe } from './description-formatter.pipe';
//import { Lecture } from './lecture';
import { Modyule } from './modyule';
import { ModyuleService } from './modyule.service';

@Component({
    moduleId: module.id,
    selector: 'modyule-resource-component',
    templateUrl: 'modyule-resource.component.html',
    directives: [FaComponent,CollapseDirective],
    pipes: [LectureTypePipe, DescriptionFormatterPipe],
    providers: [ModyuleService]
})

export class ModyuleResourceComponent implements OnInit {
    @Input()
    modyule: Modyule;
    modyuleResourcesObservable: Observable<Modyule>;

    error: any;
    errorMessage: string;

    public isCollapsed:boolean = true;

    constructor(
        private modyuleService: ModyuleService) {
    }

    ngOnInit() {
        this.modyuleResourcesObservable = this.modyuleService.getModyuleLesson(this.modyule)
            .map(modyule => {
                this.modyule.supplementaryLectures = modyule.supplementaryLectures;
                //console.log(modyule);
                return modyule;
            });
        //console.log(this.modyuleResourcesObservable);
    }
}
