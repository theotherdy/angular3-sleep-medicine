import { Week } from './week';
import { Lecture } from './lecture';
import { Mcq } from './mcq';
import { Feedback } from './feedback';

export class Modyule {  //'Module' is reserved keyword
    siteId: string;
    siteUrl: string;
    name: string;
    startDate: Date;
    endDate: Date;
    currentModyule: boolean;
    lessonUrl: string;
    resourcesUrl: string;  //could be used to point to files in Resources

    endOfModuleTitle: string = 'End of module';
    endOfModuleTabActive: boolean = false;

    feedbackDescription: string;  //for container for feedback links
    mcqsDescription: string;  //for container for assessment links

    weeks: Week[];
    supplementaryLectures: Lecture[];  //letures where type = supplementary
    mcqs: Mcq[];
    feedback: Feedback;
}
