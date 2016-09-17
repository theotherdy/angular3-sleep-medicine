import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Modyule } from './modyule';
import { Observable }     from 'rxjs/Observable';
import { Subject }     from 'rxjs/Subject';
import { Lecture } from './lecture';
import { Assessment } from './assessment';
import { Feedback } from './feedback';
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
            //urlToGet = urlToGet + myGlobals.lessonsUrl + modyule.siteId + '.json'; //old lessons
            urlToGet = urlToGet + myGlobals.contentUrl + modyule.siteId + '.json?depth=3';
            calls.push(
                this.http.get(urlToGet).cache()
                );
            //urlToGet = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment];
            //urlToGet = urlToGet + myGlobals.contentUrl + modyule.siteId + '.json';
            //calls.push(
                //this.http.get(urlToGet).cache()
                //);
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
                if (response.url.indexOf(myGlobals.contentUrl)!==-1) { //getting resources){
                    //find folder caled Start date and get the date from its description
                    let startFolder = bodyAsJson.content_collection[0].resourceChildren.find((folder:any)=> {
                        return folder.name.toLowerCase() === 'start date';
                    });
                    foundModyule.startDate = new Date(startFolder.description);
                    foundModyule.name = bodyAsJson.content_collection[0].name;
                }
            }
            subject.next(modyules);
        });

        return subject;
    }

    /**
    * For modyules-resources component to get details of the supplementary lectures and any resources it contains
    */
    getModyuleLectures(modyule: Modyule): Observable<Modyule> {
            let resourceUrl = myGlobals.contentUrl + modyule.siteId + '/Lectures.json?depth=3';
            return this.http.get(myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment] + resourceUrl)
                //.cache()
                .map(this.processLectures)
                .catch(this.handleError);
            }
    /**
    * For modyules-resources component to get details of End of module assessments and feedback
    */
    getModyuleEnd(modyule: Modyule): Observable<Modyule> {
            //let lessonUrl = modyule.lessonUrl.replace(myGlobals.unneededPartOfUrlForLessonCalls, '');
            let resourceUrl = myGlobals.contentUrl + modyule.siteId + '/End%20of%20module.json?depth=3';
            //urlToGet = urlToGet + myGlobals.contentUrl + modyule.siteId + '/Lectures.json?depth=3';
            return this.http.get(myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment] + resourceUrl)
                //.cache()
                .map(this.processEnd)
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

    private processLectures(res: Response) {
        let modyuleToReturn: Modyule = new Modyule;
        let body = res.json();
        //first deal with lectures
        let lecture: Lecture;
        modyuleToReturn.supplementaryLectures = new Array<Lecture>();
        for(let lectureData of body.content_collection[0].resourceChildren) {
            if (lectureData.type === 'org.sakaiproject.content.types.folder') { //it's a folder
                lecture = new Lecture;
                lecture.name = lectureData.name;
                lecture.id = lectureData.resourceId;
                lecture.description = lectureData.description;
                for (let lectureDetail of lectureData.resourceChildren) {
                    if(lectureDetail.type === 'org.sakaiproject.content.types.urlResource') { //it's a url
                        lecture.url = lectureDetail.url;
                    } else if (lectureDetail.type === 'org.sakaiproject.content.types.folder' && lectureDetail.name.toLowerCase()==='Resources') {
                        //get it intpo the right format for passing to resource-component
                        let trimmedResourceId = lectureDetail.resourceId.substring(0, lectureDetail.resourceId.length - 1);
                        trimmedResourceId = trimmedResourceId.replace(myGlobals.unneededPartOfUrlForLOCalls, '');
                        let resourceUrl: string = myGlobals.entityBrokerBaseUrl[myGlobals.runtimeEnvironment] + myGlobals.contentUrl + trimmedResourceId + '.json'; //remove group
                        lecture.resourcesUrl = resourceUrl;
                    }
                }
            }
        modyuleToReturn.supplementaryLectures.push(lecture);
        }
        return modyuleToReturn;
    }

    private processEnd(res: Response) {
        let modyuleToReturn: Modyule = new Modyule;
        let body = res.json();
        let assessment: Assessment;
        modyuleToReturn.assessments = new Array<Assessment>();
        let assessmentFolder = body.content_collection[0].resourceChildren.find((folder:any)=> {
            return folder.name.toLowerCase() === 'mcqs' && folder.type === 'org.sakaiproject.content.types.folder';
        });
        modyuleToReturn.assessmentsDescription = assessmentFolder.description;
        for(let assessmentData of assessmentFolder.resourceChildren) {
            if (assessmentData.type === 'org.sakaiproject.content.types.urlResource') { //it's a url
                assessment = new Assessment;
                assessment.name = assessmentData.name;
                assessment.id = assessmentData.resourceId;
                assessment.description = assessmentData.description;
                assessment.url = assessmentData.url;
            }
            modyuleToReturn.assessments.push(assessment);
        }
        let feedback: Feedback;
        let feedbackFolder = body.content_collection[0].resourceChildren.find((folder:any)=> {
            return folder.name.toLowerCase() === 'feedback' && folder.type === 'org.sakaiproject.content.types.folder';
        });
        modyuleToReturn.feedbackDescription = feedbackFolder.description;
        for(let feedbackData of feedbackFolder.resourceChildren) {
            if (feedbackData.type === 'org.sakaiproject.content.types.urlResource') { //it's a url
                modyuleToReturn.feedback = new Feedback;
                modyuleToReturn.feedback.name = feedbackData.name;
                modyuleToReturn.feedback.id = feedbackData.resourceId;
                modyuleToReturn.feedback.description = feedbackData.description;
                modyuleToReturn.feedback.url = feedbackData.url;
            }
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
