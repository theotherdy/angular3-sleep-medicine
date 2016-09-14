import { Modyule } from './modyule';

/**
 * Variables that we might want anywhere - see:
 * http://stackoverflow.com/questions/36158848/what-is-the-best-way-to-declare-a-global-variable-in-angular-2-typescript
 * Include in other component, services, etc with: import myGlobals = require('./globals');
 */

export let runtimeEnvironment: number = 0;
export let currentModyule: Modyule =  null;
//export let entityBrokerBaseUrl: string = 'app/'; //in WL "https://weblearn.ox.ac.uk/direct/"
export let entityBrokerBaseUrl: Array<string> = ['app/', 'https://weblearn.ox.ac.uk/direct/'];
//export let entityBrokerBaseUrlForLocalOnly: string = 'http://localhost:3000/'; //search and remove on live
//export let unneededPartOfUrlForHierarchyCalls: string = 'https://weblearn.ox.ac.uk/portal/hierarchy';
export let unneededPartOfUrlForHierarchyCalls: Array<string> = [];
unneededPartOfUrlForHierarchyCalls[0] = 'https://weblearn.ox.ac.uk/portal/hierarchy';
unneededPartOfUrlForHierarchyCalls[1] = 'https://weblearn.ox.ac.uk/portal/site';
export let unneededPartOfUrlForLessonCalls: string = 'https://weblearn.ox.ac.uk/direct/';
export let courseInfoUrl: string = 'd1506490-a468-46ca-a915-417d9d11be2f/Course%20Information';
export let baseSitePath: string = '/medsci/p_g/sleep_med'; //same in WL

//export let urlToSpecifyPortal: string = 'portal-hierarchy'; //in WL = 'portal-hierarchy/site.json?portalpath='
export let urlToSpecifyPortal: Array<string> = ['portal-hierarchy', 'portal-hierarchy/site.json?portalpath='];
//export let suffixForTestingOnly: string = '.json'; //in WL = ''  ie no suffix
export let suffixForTestingOnly: Array<string> = ['.json', ''];

export let lessonsUrl: string = 'lessons/site/'; //same in WL
export let lessonUrl: string = 'lessons/lesson/'; //same in WL
export let contentUrl: string = 'content/resources/group/'; //same in WL
