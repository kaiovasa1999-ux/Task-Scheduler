"use strict";
//project STate mangare
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ProjectState {
    constructor() {
        this.listeners = []; //is array from functions actualy
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, desc, people) {
        const newProject = {
            id: Math.random().toString(),
            title: title,
            desc: desc,
            people: people
        };
        this.projects.push(newProject);
        this.listeners.forEach(func => {
            func(this.projects.slice());
        });
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
const projectState = ProjectState.getInstance();
function inputValidator(input) {
    let isValid = true;
    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if (input.minLength != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length >= input.minLength;
    }
    if (input.maxLength != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length <= input.maxLength;
    }
    if (input.min != null && typeof input.value === 'number') {
        isValid = isValid && input.value > input.min;
    }
    if (input.max != null && typeof input.value === 'number') {
        isValid = isValid && input.value < input.max;
    }
    return isValid;
}
//autobind decorator
function AutoBind(_, _2, descriptor) {
    const originalMetohd = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFN = originalMetohd.bind(this);
            return boundFN;
        }
    };
    return adjDescriptor;
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        this.assignedProjects = [];
        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        projectState.addListener((projects) => {
            this.assignedProjects = projects;
            this.renderProjects();
            console.log('asfsg eeee');
        });
        this.attach();
        this.renderContent();
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }
    renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}
//ProjectINput class
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descrptionInputElemen = this.element.querySelector('#description');
        this.peoleInputElement = this.element.querySelector('#people');
        this.configure();
        this.attach();
    }
    gethereUserInput() {
        const titleInputValue = this.titleInputElement.value;
        const descInputValue = this.descrptionInputElemen.value;
        const peopleInputValue = this.peoleInputElement.value;
        const titleInputValueValidatable = {
            value: titleInputValue,
            required: true,
        };
        const descInputValueValidatable = {
            value: descInputValue,
            required: true,
        };
        const peopleInputValueValidatable = {
            value: +peopleInputValue,
            required: true,
        };
        if (!inputValidator(titleInputValueValidatable) &&
            !inputValidator(descInputValueValidatable) &&
            !inputValidator(peopleInputValueValidatable)) {
            alert('invalid input please put longer inputs');
            return;
        }
        else {
            return [titleInputValue, descInputValue, +peopleInputValue];
        }
    }
    submitHandler(event) {
        event.preventDefault();
        // console.log(this.titleInputElement.value);
        const userInput = this.gethereUserInput();
        if (Array.isArray(userInput)) {
            //tupple is array acutaliy
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            projectState.addProject(title, desc, people); //
            this.clearInputs();
        }
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descrptionInputElemen.value = '';
        this.peoleInputElement.value = '';
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
const input = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinished = new ProjectList('finished');
