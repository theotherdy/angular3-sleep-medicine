import { Component, OnInit } from '@angular/core';
//import { Router } from '@angular/router-deprecated';
//import { RouteParams } from '@angular/router-deprecated';

import { DROPDOWN_DIRECTIVES, CollapseDirective, AlertComponent } from 'ng2-bootstrap/ng2-bootstrap';

import { Modyule } from './modyule';
import { ModyuleService } from './modyule.service';
import { WeekComponent } from './week.component';

import myGlobals = require('./globals');

@Component({
    moduleId: module.id,
    selector: 'modyules-component',
    templateUrl: 'modyule.component.html',
    directives: [WeekComponent,DROPDOWN_DIRECTIVES,CollapseDirective,AlertComponent],
    providers: [ModyuleService]
})

export class ModyuleComponent implements OnInit {
    modyules: Modyule[];
    selectedModyule: Modyule;
    error: any;
    modyule: Modyule;
    noModyulesFound: boolean = true;

    errorMessage: string;
    mode = 'Observable';

    constructor(
        //private router: Router,
        //private routeParams: RouteParams,
        private modyuleService: ModyuleService) {
    }

    /**
    * Initialise ModyuleComponent
    * Get modyules and set selectedModyule based on myGlobals.currentModyule, which is set in modyule.service.ts
    * @todo Deal with no available modyules for this user
    */
    ngOnInit() {
        //So, the idea is to call getModyules, get a list of Modyules back then use switchMap to pass
        //those through to the etails bit that will add names!

        this.modyuleService.getModyules()
            .map(modyules => {
                    //console.log(modyules);
                    return modyules;
                })
            .switchMap(modyules => this.modyuleService.getModyulesDetails(modyules))
            .map(modyules => {
                    //console.log(modyules);
                    return modyules;
                })
            .subscribe(
                modyules => {
                    //@todo - deal with research modyules seaparately otherwise if two are concurrent, not sure which one will be returned
                    //first sort returned modyules into name order
                    if (modyules.length > 0) {
                        this.noModyulesFound = false;
                    }

                    modyules.sort(this.compareByModyuleDate);

                    this.modyules = modyules;

                    let tempCurrentModyule: Modyule = modyules[0];  //now they're sorted, this should be the first one
                    let currentDate: Date = new Date();
                    for (let modyule of modyules) {
                        if(currentDate > modyule.startDate && modyule.startDate > tempCurrentModyule.startDate) {
                            tempCurrentModyule = modyule;
                        }
                    //this is the currentModyule
                    myGlobals.currentModyule = tempCurrentModyule;
                    this.selectedModyule = tempCurrentModyule;
                    }
                },
                error =>  this.errorMessage = <any>error
            );
    }

    onSelect(modyule: Modyule) {
        this.selectedModyule = modyule;
    }

    getModyule(id: string) {
        return this.modyules.filter( function(mod){
            return (mod.siteId === id);
            })[0];  //ie first [0] in returned array

    }

    /*private compareByModyuleName(modyuleA: Modyule,modyuleB: Modyule): number {
        return modyuleA.name.localeCompare(modyuleB.name, undefined, {numeric: true, sensitivity: 'base'});
        //sort function to naturally sort strings: http://stackoverflow.com/a/38641281/2235210
    }*/

    private compareByModyuleDate(modyuleA: Modyule,modyuleB: Modyule): number {
            if(modyuleA.startDate<modyuleB.startDate) return -1;
            if(modyuleA.startDate>modyuleB.startDate) return 1;
            return 0;
    }

}
