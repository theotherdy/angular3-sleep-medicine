import { Tutor } from './tutor';
import { Assignment } from './assignment';
import { Resource } from './resource';


export class Seminar {
    id: string;
    description: string;
    url: string;
    learningOutcomes: string;
    learningOutcomesUrl: string;
    collapsed: boolean = true; //learning objectives initially collapses
    resourcesUrl: string;  //used to point to files e.g. reading list, pdfs, etc in Resources
    linkUrl: string;  //used to point to files e.g. reading list, pdfs, etc in Resources

    tutor: Tutor;
    resources: Resource[];
    assignments: Assignment[];
}
