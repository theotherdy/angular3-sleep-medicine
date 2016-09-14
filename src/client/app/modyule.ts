import { Week } from './week';
import { Lecture } from './lecture';
import { Assessment } from './assessment';

export class Modyule {  //'Module' is reserved keyword
    siteId: string;
    siteUrl: string;
    name: string;
    startDate: Date;
    endDate: Date;
    currentModyule: boolean;
    lessonUrl: string;
    resourcesUrl: string;  //could be used to point to files in Resources

    weeks: Week[];
    supplementaryLectures: Lecture[];  //letures where type = supplementary
    assessments: Assessment[];
}
