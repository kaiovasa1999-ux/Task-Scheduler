/// <reference path="Models/drag-drop.ts" />
/// <reference path="Enums/ProjectStatus.ts" />
/// <reference path="State/project-state.ts" />
/// <reference path="Util/validations.ts" />
/// <reference path="Decorators/Autobind.ts" />

namespace App {

    abstract class BaseComponent<T extends HTMLElement,U extends HTMLElement>{
        private templateElement: HTMLTemplateElement;
        protected hostElement: T; 
        element : U;
        constructor(templateID: string,
                    hostElementId: string,
                    whenToInsert: boolean,
                    elemntId?:string){
    
        this.templateElement = document.getElementById(templateID)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content,true);
        this.element = importedNode.firstElementChild as U;
        if (elemntId) {
            this.element.id = elemntId;
           }
                      
        this.attach(whenToInsert);
        }
                      
        private attach(insertAtBeginning: boolean) {
            this.hostElement.insertAdjacentElement(
                insertAtBeginning ? 'afterbegin' : 'beforeend',this.element);
            }
          
    
        abstract configure(): void;
        abstract renderContent():void;
    }   
    
    class ProjectItem extends BaseComponent<HTMLUListElement,HTMLLIElement> implements Draggable{
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
      
    class ProjectList extends BaseComponent<HTMLDivElement,HTMLElement> implements DragTarget{
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
                debugger;
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
    
    
    //ProjectINput class
    class ProjectInput extends BaseComponent<HTMLDivElement,HTMLFormElement> {
     
        titleInputElement: HTMLInputElement;
        descrptionInputElemen: HTMLInputElement;
        peoleInputElement: HTMLInputElement;
    
        constructor(){
            super('project-input','app',true,'user-input')
    
            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descrptionInputElemen = this.element.querySelector('#description') as HTMLInputElement;
            this.peoleInputElement = this.element.querySelector('#people') as HTMLInputElement;
            this.configure();
            this.renderContent()
        }
    
        public configure(){
            debugger;
            this.element.addEventListener('submit',this.submitHandler);
        }
        private gethereUserInput(): [string, string, number] | void {
            const titleInputValue = this.titleInputElement.value;
            const descInputValue = this.descrptionInputElemen.value;
            const peopleInputValue = this.peoleInputElement.value;
    
            const titleInputValueValidatable: Validatable = {
                value: titleInputValue,
                required: true,
            }
            const descInputValueValidatable: Validatable = {
                value: descInputValue,
                required: true,
            }
            const peopleInputValueValidatable: Validatable = {
                value: +peopleInputValue,
                required: true,
            }
    
            if(
                !inputValidator(titleInputValueValidatable) &&
                !inputValidator(descInputValueValidatable) &&
                !inputValidator(peopleInputValueValidatable)
            ) {
                alert('invalid input please put longer inputs')
                return;
            }else{
                return [titleInputValue,descInputValue,+peopleInputValue];
            }
        }
    
        @AutoBind
        private submitHandler(event: Event){
            event.preventDefault();
            debugger;
            const userInput =this.gethereUserInput();
            if(Array.isArray(userInput)){
                //tupple is array acutaliy
                const [title,desc,people] = userInput;
                projectState.addProject(title,desc,people);//
                this.clearInputs();
            }
            
        }
        
        private clearInputs() {
            this.titleInputElement.value = '';
            this.descrptionInputElemen.value = '';
            this.peoleInputElement.value = '';
        }
    
        renderContent(): void {}
    }

    new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished');
}


