namespace App{
    export class ProjectItem extends BaseComponent<HTMLUListElement,HTMLLIElement> implements Draggable{
        private project: Project
    
        get personsAssigned(){
            if(this.project.people === 1){
                return 'person'
            }
            else{
                return 'peoples'
            }
        }
    
        constructor(hostId:string,project: Project){
            super('single-project', hostId, false, project.id);
            this.project = project
    
            this.configure();
            this.renderContent();
        }
    
        @AutoBind
        dragStartHandler(event: DragEvent): void {
            event.dataTransfer!.setData('text/plain', this.project.id);
            event.dataTransfer!.effectAllowed = 'move';
        }
        
        @AutoBind
        dragEndHandler(event: DragEvent): void {
            console.log(event);
            
        }
        configure(): void {
            this.element.addEventListener('dragstart',this.dragStartHandler)
            this.element.addEventListener('dragend',this.dragEndHandler)
        }
    
        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent = this.project.people.toString() + ' ' + this.personsAssigned + ' assigned';
            this.element.querySelector('p')!.textContent = this.project.description;
        }
    }
}