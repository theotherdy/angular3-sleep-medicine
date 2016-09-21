import { Component, OnInit } from '@angular/core';
//import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';

import { ModyuleComponent } from './modyule.component';
import { ResourceComponent } from './resource.component';
import { AssessmentComponent } from './assessment.component';

import myGlobals = require('./globals');

@Component({
    moduleId: module.id,
    selector: 'my-app',
    /*template: `
        <modyules-component></modyules-component>
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">Course information</a>
                </div>
            </div>
        </nav>
        <resource-component [resourcesUrl] = "resourcesUrl"></resource-component>
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">Assessment</a>
                </div>
            </div>
        </nav>
        <assessment-component [assessmentUrl] = "assessmentUrl"></assessment-component>
        `,*/
    styleUrls:  ['app.component.css'],
    templateUrl: 'app.component.html',
    directives: [AssessmentComponent, ModyuleComponent, ResourceComponent]
    //directives: [ROUTER_DIRECTIVES],
    //providers: [
    //  ROUTER_PROVIDERS
    //]
})

//@RouteConfig([
//    {
//        path: '/module/:id',
//        name: 'Module',
//        component: ModyuleComponent
//    },{
//        path: '/current-module',
//        name: 'CurrentModule',
//        component: ModyuleComponent,
//        useAsDefault: true
//    }
//])

export class AppComponent implements OnInit {
    title = 'Sleep Medicine';
    ebBase = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
    resourcesUrl = this.ebBase + myGlobals.contentUrl + myGlobals.courseInfoUrl + '.json?depth=3';
    assessmentUrl = this.ebBase + myGlobals.contentUrl + myGlobals.assessmentInfoUrl + '.json?depth=3';

    ngOnInit() {
        let rhColumn = window.parent.document.getElementById('col2of2');
        let lhColumn = window.parent.document.getElementById('col1of2');
        if(rhColumn) {
            rhColumn.style.display = 'none';
        }
        if(lhColumn) {
            lhColumn.style.width = '100%';
        }
    }
}
