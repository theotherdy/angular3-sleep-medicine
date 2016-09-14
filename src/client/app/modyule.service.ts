import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Modyule } from './modyule';
import { Observable }     from 'rxjs/Observable';
import { Subject }     from 'rxjs/Subject';
import { Lecture } from './lecture';
//import { Resource } from './resource';

import './rxjs-operators';  // Add the RxJS Observable operators we need in this app.

//import { MODYULES } from './mock-modyules';

import myGlobals = require('./globals');

@Injectable()
export class ModyuleService {

    private modyulesUrl: string;

    constructor (private http: Http) {}

    getModyules (): Observable<Modyule[]> {
        this.modyulesUrl = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
        this.modyulesUrl = this.modyulesUrl + myGlobals.urlToSpecifyPortal[myGlobals.runtimeEnvironment];
        this.modyulesUrl = this.modyulesUrl + myGlobals.baseSitePath + myGlobals.suffixForTestingOnly[myGlobals.runtimeEnvironment];
        return this.http.get(this.modyulesUrl)
            .cache()
            .map(this.initialiseModyules)
            .catch(this.handleError);
    }

    getModyulesDetails (modyules:Modyule[]): Observable<Modyule[]> {
        let calls: any[]  = [];

        for (let modyule of modyules){
            let urlToGet: string = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
            urlToGet = urlToGet + myGlobals.lessonsUrl + modyule.siteId + '.json';
            calls.push(
                this.http.get(urlToGet).cache()
                );
            urlToGet = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
            urlToGet = urlToGet + myGlobals.contentUrl + modyule.siteId + '.json';
            calls.push(
                this.http.get(urlToGet).cache()
                );
        }

        var subject = new Subject<Modyule[]>();       //see: http://stackoverflow.com/a/38668416/2235210 for why Subject

        Observable.forkJoin(calls).subscribe((res: any) => {
            for (let response of res){
                //Note this is a really very awkward way of matching modyule with a siteId assigned in getModyules (above)
                //with the correct response from forkJoin (could come back in any order), by looking at the requested url
                //from the response object
                let foundModyule = modyules.find(modyule=> {
                    return response.url.indexOf(modyule.siteId)!==-1;
                });
                let bodyAsJson = JSON.parse(response._body);
                if(response.url.indexOf(myGlobals.lessonsUrl)!==-1) { //getting lessons
                    foundModyule.name = bodyAsJson.lessons_collection[0].lessonTitle;
                    foundModyule.lessonUrl = bodyAsJson.lessons_collection[0].contentsURL;
                    //foundModyule.name = bodyAsJson.lessons_collection[0].lessonTitle;
                } else if (response.url.indexOf(myGlobals.contentUrl)!==-1) { //getting resources){
                    //find folder caled Start date and get the date from its description
                    let startFolder = bodyAsJson.content_collection[0].resourceChildren.find((folder:any)=> {
                        return folder.name.toLowerCase() === 'start date';
                    });
                    foundModyule.startDate = new Date(startFolder.description);
                }
                //console.log(foundModyule)
            }
            subject.next(modyules);
        });

        return subject;
    }

    /**
    * For modyules-resources component to get details of the materials inside it
    */

    getModyuleLesson(modyule: Modyule): Observable<Modyule> {
        let lessonUrl = modyule.lessonUrl.replace(myGlobals.unneededPartOfUrlForLessonCalls, '');
        return this.http.get(myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment] + lessonUrl + '.json')
            //.cache()
            .map(this.processLessons)
            .catch(this.handleError);
        }

    private initialiseModyules(res: Response) {
        let body = res.json();
        let modyulesToReturn: any[] = [];//: Modyule[] = [];
        for (let site of body.subsites) {
            if(site.siteUrl.indexOf('mod')!==-1) {  //ie only add subsites with 'mod' in the name
                let tempModyule = new Modyule;
                tempModyule.siteId = site.siteId;
                tempModyule.siteUrl = site.siteUrl;
                modyulesToReturn.push(tempModyule);
            }
        }
        return modyulesToReturn;
    }

    private processLessons(res: Response) {
        let modyuleToReturn: Modyule = new Modyule;
        let body = res.json();
        //first deal with lectures
        let lecturesPage = body.contentsList.find((subPage:any)=> {
            return subPage.name.toLowerCase() === 'lectures';
            });
        modyuleToReturn.supplementaryLectures = new Array<Lecture>();
        for(let lectureData of lecturesPage.contentsList) {
            let lecture: Lecture = new Lecture;
            lecture.type = 'main'; //because it's within a week
            lecture.name = lectureData.name;
            lecture.id = lectureData.id;
            for (let lectureDetail of lectureData.contentsList) {
                if(lectureDetail.name.toLowerCase()==='lecture link') {
                    lecture.url = lectureDetail.url;
                } else if (lectureDetail.name.toLowerCase()==='learning outcomes') {
                    lecture.learningOutcomesUrl = lectureDetail.contentsURL;
                } else if (lectureDetail.type === 5) {
                    if(lectureDetail.html.indexOf('data-directory')===-1) {
                        //standard html text content - assuming the lecture description
                        lecture.description = lectureDetail.html;
                    } else {
                        //link to a resources folder
                        //extract the url from the .html property:
                        //data-directory='\/group\/c3254610-b325-4a0c-8d1a-c817099eb5fe\/\/Lecture 1\/'
                        let posDataDirectory = lectureDetail.html.indexOf('data-directory');
                        let posFirstApostrophe = lectureDetail.html.indexOf('\'',posDataDirectory);
                        let posLastApostrophe = lectureDetail.html.indexOf('\'',posFirstApostrophe+1);
                        lecture.resourcesUrl = lectureDetail.html.substr(posFirstApostrophe+1,posLastApostrophe-posFirstApostrophe-1);
                        if(lecture.resourcesUrl.charAt(lecture.resourcesUrl.length - 1)==='/') {  //to remove final '/' if present
                            lecture.resourcesUrl = lecture.resourcesUrl.substring(0, lecture.resourcesUrl.length - 1);
                        }
                    }
                }
            }
        modyuleToReturn.supplementaryLectures.push(lecture);
        }

        return modyuleToReturn;
    }

    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

}
