import { Lecture } from './lecture';
import { Seminar } from './seminar';
import { Modyule } from './modyule';


export class Week {
    siteId: string;
    siteUrl: string;
    lessonUrl: string;
    startDate: Date;
    endDate: Date;
    name: string;
    active: boolean;
    resourcesUrl: string;  //could be used to point to files in Resources

    modyule: Modyule;

    lectures: Lecture[];
    seminars: Seminar[];
}
