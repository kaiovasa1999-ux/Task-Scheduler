enum ProjectStatus{
    Active,
    Finished
}

class Project{
    constructor(
        public id: string,
        public Title:string,
        public description:string,
        public people:number,
        public stattus: ProjectStatus
    ){}
}

type Listener = (items: Project[]) => void;
//project STate mangare

class ProjectState{
    private listeners: Listener[] = [];//is array from functions actualy
    private projects: Project[] = [];
    private static instance: ProjectState;
    private constructor(){
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
            Math.random.toString(),title,desc,people,ProjectStatus.Active)

        this.projects.push(newProject);
        this.listeners.forEach(func => {
            func(this.projects.slice());
        });
    }

    addListener(listenerFn: Listener){
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
        const importedNode = document.importNode(this.templateElement.content, true);

        this.element = importedNode.firstElementChild as U;
        if(elemntId){
            this.element.id = elemntId;
        }

        this.attach(whenToInsert);
    }

    private attach(whenToInsert:boolean){
        //if is true isnert afterbegin else beforebegin
        this.hostElement.insertAdjacentElement(whenToInsert? 'afterbegin': 'beforebegin',this.element);
    }

    abstract configure(): void;
    abstract renderContent():void;
}   

class ProjectList  extends BaseComponent<HTMLDivElement,HTMLElement>{
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished'){
        super('project-list','app',false,`${type}-projects`);
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }

    renderProjects(){
        debugger;
        const listEl = document.getElementById(`${this.type}-projects`)! as HTMLUListElement;
        for (const prjItem of this.assignedProjects) {
          const listItem = document.createElement('li');
          listItem.textContent = prjItem.Title;
          listEl.appendChild(listItem)
        }
    }

    public configure(): void {
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
        // console.log(this.titleInputElement.value);
        const userInput =this.gethereUserInput();
        if(Array.isArray(userInput)){
            //tupple is array acutaliy
            const [title,desc,people] = userInput;
            console.log(title,desc,people);
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