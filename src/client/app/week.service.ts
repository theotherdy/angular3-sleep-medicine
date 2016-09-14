import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Week } from './week';
import { Lecture } from './lecture';
import { Seminar } from './seminar';
import { Resource } from './resource';
import { Observable }     from 'rxjs/Observable';
import { Subject }     from 'rxjs/Subject';

import './rxjs-operators';  // Add the RxJS Observable operators we need in this app.

//import { MODYULES } from './mock-modyules';

import myGlobals = require('./globals');

@Injectable()
export class WeekService {

    constructor (private http: Http) {}

    getWeeks (modyuleUrl: string): Observable<Week[]> {
        modyuleUrl = modyuleUrl.replace(myGlobals.unneededPartOfUrlForHierarchyCalls[myGlobals.runtimeEnvironment], '');
        if (myGlobals.runtimeEnvironment === 1) {//we're live in WL
            //fudge to change parameters returned by EB portal-hieracrchy so they can be used as portalpath query string
            modyuleUrl = modyuleUrl.substring(1); //removes first colon
            modyuleUrl = modyuleUrl.replace(/:/g,'/'); //converts colons globally to '/'
        }
        let urlToGet: string = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
        urlToGet = urlToGet + myGlobals.urlToSpecifyPortal[myGlobals.runtimeEnvironment];
        urlToGet = urlToGet + modyuleUrl+myGlobals.suffixForTestingOnly[myGlobals.runtimeEnvironment];
        return this.http.get(urlToGet)
            .cache()
            .map(this.initialiseWeeks)
            .catch(this.handleError);
    }

    getWeeksDetails (weeks:Week[]): Observable<Week[]> {
        let calls: any[]  = [];

        for (let week of weeks){
            let urlToGet: string = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
            urlToGet = urlToGet + myGlobals.lessonsUrl + week.siteId + '.json';
            calls.push(
                this.http.get(urlToGet).cache()
                );
        }

        var subject = new Subject<Week[]>();  //see: http://stackoverflow.com/a/38668416/2235210 for why Subject

        Observable.forkJoin(calls).subscribe((res: any) => {
            for (let response of res){
                // Note this is a really very awkward way of matching modyule with a siteId assigned in getModyules (above)
                // with the correct response from forkJoin (could come back in any order), by looking at the
                // requested url from the response object
                let foundWeek = weeks.find(week=> {
                    return response.url.indexOf(week.siteId)!==-1;
                });

                let bodyAsJson = JSON.parse(response._body);
                foundWeek.name = bodyAsJson.lessons_collection[0].lessonTitle;
                foundWeek.lessonUrl = bodyAsJson.lessons_collection[0].contentsURL;
                }
            subject.next(weeks);
        });

        return subject;
    }

    /**
    * For week-detail component to get details of the materials inside it
    */

    getWeekLesson(week: Week): Observable<Week> {
        let lessonUrl = week.lessonUrl.replace(myGlobals.unneededPartOfUrlForLessonCalls, '');
        return this.http.get(myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment]+lessonUrl + '.json')
            //.cache()
            .map(this.processLessons)
            .catch(this.handleError);
        }

    getLecturesDetails (week:Week): Observable<Week> {
        let calls: any[]  = [];

        for (let lecture of week.lectures) {
            if(lecture.learningOutcomesUrl !== undefined && lecture.learningOutcomes===undefined) {
                let lessonUrl = lecture.learningOutcomesUrl.replace(myGlobals.unneededPartOfUrlForLessonCalls, '');
                calls.push(  //learning outcomes
                    this.http.get(myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment] + lessonUrl + '.json')//.cache()
                    );
            }
            if(lecture.resourcesUrl !== undefined && lecture.resources===undefined) {
                let resourcesUrl = lecture.resourcesUrl.replace('/group/', '');
                let urlToGet: string = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
                urlToGet = urlToGet + myGlobals.contentUrl + resourcesUrl + '.json';
                calls.push(  //reading list, other resources
                    this.http.get(urlToGet)//.cache()
                    );
            }
        }

        var subject = new Subject<Week>();  //see: http://stackoverflow.com/a/38668416/2235210 for why Subject

        Observable.forkJoin(calls).subscribe((res: any) => {
            for (let response of res){
                let bodyAsJson = JSON.parse(response._body);
                if(response.url.indexOf(myGlobals.lessonUrl)!==-1) { //deal with learning outcomes reached as a lesson
                    let foundLecture = week.lectures.find(lecture=> {
                        let lessonUrl = lecture.learningOutcomesUrl.replace(myGlobals.unneededPartOfUrlForLessonCalls, '');
                        return response.url.indexOf(lessonUrl)!==-1;
                    });
                    foundLecture.learningOutcomes = bodyAsJson.contentsList[0].html;
                } else if (response.url.indexOf(myGlobals.contentUrl)!==-1) { //deal with resources reached as a resource via content
                    let foundLecture = week.lectures.find(lecture=> {
                        //first remove any double forward slashes which WL seem to insert sometimes
                        let cleanedResourcesUrl = lecture.resourcesUrl.replace('//','/');
                            return bodyAsJson.content_collection[0].resourceId.indexOf(cleanedResourcesUrl)!==-1;
                    });
                    foundLecture.resources = new Array<Resource>();  //it won't have any yet

                    for(let resource of bodyAsJson.content_collection[0].resourceChildren){
                        let tempResource: Resource = new Resource;
                        tempResource.name = resource.name;
                        tempResource.url = resource.url;
                        if(resource.description !== '') {
                            tempResource.description = resource.description;
                        }
                        if(resource.type === 'org.sakaiproject.citation.impl.CitationList') { //it's a reading list
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
                        foundLecture.resources.push(tempResource);
                    }
                }
            }
            subject.next(week);
        });

        return subject;
    }

    getSeminarsDetails (week:Week): Observable<Week> {
        let calls: any[]  = [];

        for (let seminar of week.seminars) {
            if(seminar.learningOutcomesUrl !== undefined && seminar.learningOutcomes===undefined) {
                let lessonUrl = seminar.learningOutcomesUrl.replace(myGlobals.unneededPartOfUrlForLessonCalls, '');
                calls.push(  //learning outcomes
                    this.http.get(myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment] + lessonUrl + '.json')//.cache()
                    );
            }
            if(seminar.resourcesUrl !== undefined && seminar.resources===undefined) {
                let resourcesUrl = seminar.resourcesUrl.replace('/group/', '');
                let urlToGet: string = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
                urlToGet = urlToGet + myGlobals.contentUrl + resourcesUrl + '.json';
                calls.push(  //reading list, other resources
                    this.http.get(urlToGet)//.cache()
                    );
            }
        }

        var subject = new Subject<Week>();  //see: http://stackoverflow.com/a/38668416/2235210 for why Subject

        Observable.forkJoin(calls).subscribe((res: any) => {
            for (let response of res){
                let bodyAsJson = JSON.parse(response._body);
                if(response.url.indexOf(myGlobals.lessonUrl)!==-1) { //deal with learning outcomes reached as a lesson
                    let foundSeminar = week.seminars.find(seminar=> {
                        let lessonUrl = seminar.learningOutcomesUrl.replace(myGlobals.unneededPartOfUrlForLessonCalls, '');
                        return response.url.indexOf(lessonUrl)!==-1;
                    });
                    foundSeminar.learningOutcomes = bodyAsJson.contentsList[0].html;
                } else if (response.url.indexOf(myGlobals.contentUrl)!==-1) { //deal with resources reached as a resource via content
                    let foundSeminar = week.seminars.find(seminar=> {
                        //first remove any double forward slashes which WL seem to insert sometimes
                        let cleanedResourcesUrl = seminar.resourcesUrl.replace('//','/');
                            return bodyAsJson.content_collection[0].resourceId.indexOf(cleanedResourcesUrl)!==-1;
                    });
                    foundSeminar.resources = new Array<Resource>();  //it won't have any yet

                    for(let resource of bodyAsJson.content_collection[0].resourceChildren){
                        let tempResource: Resource = new Resource;
                        tempResource.name = resource.name;
                        tempResource.url = resource.url;
                        if(resource.description !== '') {
                            tempResource.description = resource.description;
                        }
                        if(resource.type === 'org.sakaiproject.citation.impl.CitationList') { //it's a reading list
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
                        foundSeminar.resources.push(tempResource);
                    }
                }
            }
            subject.next(week);
        });

        return subject;
    }


    private initialiseWeeks(res: Response) {
        let body = res.json();
        let weeksToReturn: any[] = []; //: Week[] = []; //seems to need to be any!
        for (let site of body.subsites){
            if(site.siteUrl.indexOf('mod')!==-1) {  //ie only add subsites with 'mod' in the name
                let tempWeek = new Week;
                tempWeek.siteId = site.siteId;
                tempWeek.siteUrl = site.siteUrl;
                weeksToReturn.push(tempWeek);
            }
        }
        return weeksToReturn;
    }

    private processLessons(res: Response) {
        let weekToReturn: Week = new Week;
        let body = res.json();
        //let bodyAsJson = JSON.parse(res._body);
        //first deal with lectures
        let lecturesPage = body.contentsList.find((subPage:any)=> {
            return subPage.name.toLowerCase() === 'lectures';
            });
        weekToReturn.lectures = new Array<Lecture>();
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

                } //else if (lectureDetail.name.toLowerCase()=='Lecture link'){
                    //lecture.linkUrl = lectureDetail.sakaiId;
                //}

            }
        //description: string;
        weekToReturn.lectures.push(lecture);
        }
        //then deal with seminar
        let seminarPage = body.contentsList.find((subPage:any)=> {
            return subPage.name.toLowerCase() === 'seminar';
            });
        weekToReturn.seminars = new Array<Seminar>();
        let seminar: Seminar = new Seminar;
        seminar.id = seminarPage.id;
        for (let seminarDetail of seminarPage.contentsList) {
            if(seminarDetail.type===1) {
                seminar.url = seminarDetail.url;
            } else if (seminarDetail.name.toLowerCase()==='learning outcomes') {
                seminar.learningOutcomesUrl = seminarDetail.contentsURL;
            } else if (seminarDetail.type === 5) {
                if(seminarDetail.html.indexOf('data-directory')===-1) {
                    //standard html text content - assuming the lecture description
                    seminar.description = seminarDetail.html;
                } else {
                    //link to a resources folder
                    //extract the url from the .html property:
                    //data-directory='\/group\/c3254610-b325-4a0c-8d1a-c817099eb5fe\/\/Lecture 1\/'
                    let posDataDirectory = seminarDetail.html.indexOf('data-directory');
                    let posFirstApostrophe = seminarDetail.html.indexOf('\'',posDataDirectory);
                    let posLastApostrophe = seminarDetail.html.indexOf('\'',posFirstApostrophe+1);
                    seminar.resourcesUrl = seminarDetail.html.substr(posFirstApostrophe+1,posLastApostrophe-posFirstApostrophe-1);
                    if(seminar.resourcesUrl.charAt(seminar.resourcesUrl.length - 1)==='/') {  //to remove final '/' if present
                        seminar.resourcesUrl = seminar.resourcesUrl.substring(0, seminar.resourcesUrl.length - 1);
                    }
                }

            }
        }
        weekToReturn.seminars.push(seminar);

        return weekToReturn;
    }

    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

}
