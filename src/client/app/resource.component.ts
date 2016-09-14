import { Component, Input, OnInit } from '@angular/core';

//import {CORE_DIRECTIVES} from '@angular/common';
import { Observable }     from 'rxjs/Observable';

import { Resource }     from './resource';
import { ResourceService }     from './resource.service';
import { TreeViewComponent }     from './tree-view.component';

import { LectureTypePipe } from './lecture-type.pipe';
import { DescriptionFormatterPipe } from './description-formatter.pipe';


@Component({
    moduleId: module.id,
    selector: 'resource-component',
    templateUrl: 'resource.component.html',
    directives: [TreeViewComponent],
    pipes: [LectureTypePipe, DescriptionFormatterPipe],
    providers: [ResourceService]
})

export class ResourceComponent implements OnInit {
    @Input()
    resourcesUrl: string;
    resourcesObservable: Observable<Resource>;

    error: any;
    errorMessage: string;

    public isCollapsed:boolean = true;

    constructor(
        private resourceService: ResourceService) {
    }

    ngOnInit() {
        this.resourcesObservable = this.resourceService.getResources(this.resourcesUrl)
            .map(resource => {
                return resource;
            });
    }
}
