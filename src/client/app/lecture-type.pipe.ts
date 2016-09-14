import { Pipe, PipeTransform } from '@angular/core';

import { Lecture } from './lecture';

/*
 * Shows only lectures that match the type parameter passed in
 * 'main' = those which are listed in WL Lectures sub-page
 * 'supplementray' = those which are listed in WL Lectures sub-page
*/

@Pipe({name: 'lectureType'})
export class LectureTypePipe implements PipeTransform {
    transform(allLectures: Lecture[], lectureType: string): Lecture[] {
        if(allLectures!==null) {
            return allLectures.filter(lecture => lecture.type===lectureType);
        } else {
            return allLectures;
        }
    }
}
