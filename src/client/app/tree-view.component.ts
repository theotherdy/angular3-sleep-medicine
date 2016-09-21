import {Component, Input} from '@angular/core';
import {Resource} from './resource';

import { FaComponent } from 'angular2-fontawesome/components';

@Component({
    moduleId: module.id,
    selector: 'tree-view',
    templateUrl: 'tree-view.component.html',
    styleUrls:  ['tree-view.component.css'],
    directives: [TreeViewComponent,FaComponent]
})
//Note: based on: http://www.syntaxsuccess.com/angular-2-samples/#/demo/treeview
export class TreeViewComponent {
    @Input() resources: Array<Resource>;
}
