import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Resource } from './resource';
import { Observable }     from 'rxjs/Observable';

import './rxjs-operators';  // Add the RxJS Observable operators we need in this app.

//import { MODYULES } from './mock-modyules';

@Injectable()
export class ResourceService {

    constructor (private http: Http) {}

    getResources (resourcesUrl: string): Observable<Resource> {
        return this.http.get(resourcesUrl)
            .map(this.processResources)
            .catch(this.handleError);
    }

    private processResources = (res: Response) => { //have to use instance syntax to allow this.processResource
        let body = res.json();
        let resourceToReturn: any = new Resource;  //exepecting observable so can't return Resource
        resourceToReturn.name = body.content_collection[0].name;
        if(body.content_collection[0].description !== '') {
            resourceToReturn.description = body.content_collection[0].description;
        }
        if(body.content_collection[0].resourceChildren.length > 0) {
            resourceToReturn.children = this.processResource(body.content_collection[0].resourceChildren);
        }
        return resourceToReturn;
    }

    private processResource(resourceChildrenJson: any) {
        let resourcesToReturn = new Array<Resource>();
        for(let resource of resourceChildrenJson) {
            let tempResource: Resource = new Resource;
            tempResource.name = resource.name;
            tempResource.url = resource.url;
            if(resource.description !== '') {
                tempResource.description = resource.description;
            }
            if(resource.type === 'org.sakaiproject.content.types.folder') { //it's a folder
                tempResource.fileType = 'folder';
                tempResource.children = this.processResource(resource.resourceChildren);
            } else if(resource.type === 'org.sakaiproject.citation.impl.CitationList') { //it's a reading list
                tempResource.fileType = 'reading';
            } else if (resource.url.indexOf('pdf')!==-1) {
                tempResource.fileType = 'pdf';
            } else if (resource.url.indexOf('xls')!==-1) {
                tempResource.fileType = 'xls';
            } else if (resource.url.indexOf('doc')!==-1) {
                tempResource.fileType = 'doc';
            } else {
                tempResource.fileType = 'file';
            }
        resourcesToReturn.push(tempResource);
        }
    return resourcesToReturn;
    }



    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

}
