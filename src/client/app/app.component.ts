import { Component, OnInit } from '@angular/core';
//import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';

import { ModyuleComponent } from './modyule.component';
import { ResourceComponent } from './resource.component';

import myGlobals = require('./globals');

@Component({
    selector: 'my-app',
    template: `
        <!--h1>{{title}}</h1-->
        <modyules-component></modyules-component>
        <resource-component [resourcesUrl] = "resourcesUrl"></resource-component>
        `,
    directives: [ModyuleComponent, ResourceComponent],
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
