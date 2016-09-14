export class Resource {
    id: string;
    name: string;
    description: string;
    url: string;
    fileType: string;
    expanded: boolean = false;
    children: Resource[];

    toggle() {
        this.expanded = !this.expanded;
    }
}
