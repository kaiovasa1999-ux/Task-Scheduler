//Drag and drop interface

interface Draggable{
    dragStartHandler(event: DragEvent): void
    dragEndHandler(event: DragEvent): void
}
interface DragTarget{
    dragOverHandler(event: DragEvent): void
    dropHandler(event: DragEvent): void
    dragLeaveHandler(event: DragEvent): void
}

enum ProjectStatus{
    Active,
    Finished
}

class Project{
    constructor(
        public id: string,
        public title:string,
        public description:string,
        public people:number,
        public stattus: ProjectStatus
    ){}
}

class State<T> {
    protected listeners: Listener<T>[] = [];//is array from functions actualy

    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn);
    }
}

type Listener<T> = (items: T[]) => void;
//project STate mangare

class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;
    private constructor(){
        super()
    }

    public static getInstance() : ProjectState{
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title:string, desc: string, people:number){
        const newProject = new Project(
            Math.random().toString(),title,desc,people,ProjectStatus.Active)

        this.projects.push(newProject);

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
        this.updateListeners()
    }

    switchProjectStatus(projectId:string, newStatus: ProjectStatus){
       const project = this.projects.find(p => p.id === projectId);

       if(project != null && project.stattus !== newStatus){
         project.stattus = newStatus;
         this.updateListeners();
       }
    }

    private updateListeners(){
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }

    addListener(listenerFn: Listener<Project>){
        this.listeners.push(listenerFn);
    }
}
//global instance single
const projectState = ProjectState.getInstance();

//input validation
interface Validatable{
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function inputValidator(input: Validatable){
    let isValid = true;
    if(input.required){
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if(input.minLength != null && typeof input.value === 'string'){
        isValid = isValid &&  input.value.length >= input.minLength;
    }
    if(input.maxLength != null && typeof input.value === 'string'){
        isValid = isValid &&  input.value.length <= input.maxLength;
    }
    if(input.min != null && typeof input.value === 'number'){
        isValid = isValid && input.value > input.min;
    }
    if(input.max != null && typeof input.value === 'number'){
        isValid = isValid && input.value < input.max
    }

    return isValid;
}

//autobind decorator
function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor){
    const originalMetohd= descriptor.value; 
    const adjDescriptor: PropertyDescriptor ={
        configurable: true,
        get () {
            const boundFN = originalMetohd.bind(this);
            return boundFN;
        }
    }
    return adjDescriptor;
}

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

const input = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinished = new ProjectList('finished');