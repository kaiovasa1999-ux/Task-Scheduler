//project STate mangare

class ProjectState{
    private listeners: any[] = [];//is array from functions actualy
    private projects: any[] = [];
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
        const newProject = {
            id: Math.random().toString(),
            title: title,
            desc: desc,
            people: people
        }

        this.projects.push(newProject);
        this.listeners.forEach(func => {
            func(this.projects.slice());
        });
    }

    addListener(listenerFn: Function){
        this.listeners.push(listenerFn);
    }
}

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

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element : HTMLElement;
    assignedProjects: any[];

    constructor(private type: 'active' | 'finished'){
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];
        const importNode = document.importNode(this.templateElement.content,true);

        this.element = importNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects:any) =>{
            this.assignedProjects = projects;
            this.renderProjects()
            console.log('asfsg eeee')
        })
        this.attach();
        this.renderContent();
    }

    renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        for (const prjItem of this.assignedProjects) {
          const listItem = document.createElement('li');
          listItem.textContent = prjItem.title;
          listEl.appendChild(listItem)
        }
    }
    private renderContent(){
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id =listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';

    }

    private attach(){
        this.hostElement.insertAdjacentElement('beforeend',this.element);
    }


}


//ProjectINput class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descrptionInputElemen: HTMLInputElement;
    peoleInputElement: HTMLInputElement;

    constructor(){
        this.templateElement =  document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descrptionInputElemen = this.element.querySelector('#description') as HTMLInputElement;
        this.peoleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
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

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',this.element);
    }

    private configure(){
        this.element.addEventListener('submit',this.submitHandler);
    }
}

const input = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinished = new ProjectList('finished');