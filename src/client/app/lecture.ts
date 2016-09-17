import { Tutor } from './tutor';
import { Resource } from './resource';
import { Feedback } from './feedback';

export class Lecture {
    id: string;
    name: string;
    description: string;
    type: string; //main or supplementary
    url: string;
    learningOutcomesUrl: string;
    learningOutcomes: string;
    collapsed: boolean = true; //learning objectives initially collapses
    resourcesUrl: string;  //used to point to files e.g. reading list, pdfs, etc in Resources
    linkUrl: string;  //used to point to files e.g. reading list, pdfs, etc in Resources

    feedback: Feedback;
    resources: Resource[];
    tutor: Tutor;
}
