import { Tutor } from './tutor';
import { Assignment } from './assignment';
import { Resource } from './resource';
import { SeminarInstance } from './seminar-instance';


export class Seminar {
    id: string;
    description: string;
    learningOutcomes: string;
    learningOutcomesUrl: string;
    collapsed: boolean = true; //learning objectives initially collapses
    resourcesUrl: string;  //used to point to files e.g. reading list, pdfs, etc in Resources
    linkUrl: string;  //used to point to files e.g. reading list, pdfs, etc in Resources

    tutor: Tutor;
    seminarInstances: SeminarInstance[];
    resources: Resource[];
    assignments: Assignment[];
}
