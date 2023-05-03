namespace App{
    export class ProjectList extends BaseComponent<HTMLDivElement,HTMLElement> implements DragTarget{
        assignedProjects: Project[];
    
        constructor(private type: 'active' | 'finished'){
            super('project-list','app',false,`${type}-projects`);
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
    
        @AutoBind
        dragOverHandler(event: DragEvent): void {
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
                event.preventDefault();
                const listEl = this.element.querySelector('ul')!;
                listEl.classList.add('droppable');
            }
        }
    
        @AutoBind
        dropHandler(event: DragEvent): void {
            const projectId = (event.dataTransfer!.getData('text/plain'));
            projectState.switchProjectStatus(projectId,this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
        }
    
        @AutoBind
        dragLeaveHandler(_: DragEvent): void {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
        }
        
        private renderProjects() {
            const listEl = document.getElementById(
              `${this.type}-project-list`
            )! as HTMLUListElement;
            listEl.innerHTML = '';
            for (const prjItem of this.assignedProjects) {
              new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
            }
          }
    
        public configure(): void {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
    
            projectState.addListener((projects) =>{
                const filterProjects = projects.filter(prj =>{
                    if(this.type ==='active'){
                        return prj.stattus === ProjectStatus.Active;
                    }
    
                    return prj.stattus === ProjectStatus.Finished;
                })
                this.assignedProjects = filterProjects;
                this.renderProjects()
            })
        }
    
        renderContent(){
            const listId = `${this.type}-project-list`;
            this.element.querySelector('ul')!.id =listId;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
        }
    }
}