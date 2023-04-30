"use strict";
//Drag and drop interface
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, stattus) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.stattus = stattus;
    }
}
class State {
    constructor() {
        this.listeners = []; //is array from functions actualy
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
//project STate mangare
class ProjectState extends State {
    constructor() {
        super();
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
        const newProject = new Project(Math.random().toString(), title, desc, people, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
        this.updateListeners();
    }
    switchProjectStatus(projectId, newStatus) {
        const project = this.projects.find(p => p.id === projectId);
        if (project != null && project.stattus !== newStatus) {
            project.stattus = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
//global instance single
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
class BaseComponent {
    constructor(templateID, hostElementId, whenToInsert, elemntId) {
        this.templateElement = document.getElementById(templateID);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (elemntId) {
            this.element.id = elemntId;
        }
        this.attach(whenToInsert);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ProjectItem extends BaseComponent {
    get personsAssigned() {
        if (this.project.people === 1) {
            return 'person';
        }
        else {
            return 'peoples';
        }
    }
    constructor(hostId, project) {
        super('single-project', hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(event) {
        console.log(event);
    }
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = this.project.people.toString() + ' ' + this.personsAssigned + ' assigned';
        this.element.querySelector('p').textContent = this.project.description;
    }
}
__decorate([
    AutoBind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    AutoBind
], ProjectItem.prototype, "dragEndHandler", null);
class ProjectList extends BaseComponent {
    constructor(type) {
        super('project-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul');
            listEl.classList.add('droppable');
        }
    }
    dropHandler(event) {
        const projectId = (event.dataTransfer.getData('text/plain'));
        projectState.switchProjectStatus(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }
    dragLeaveHandler(_) {
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-project-list`);
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul').id, prjItem);
        }
    }
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        projectState.addListener((projects) => {
            const filterProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.stattus === ProjectStatus.Active;
                }
                return prj.stattus === ProjectStatus.Finished;
            });
            debugger;
            this.assignedProjects = filterProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
    }
}
__decorate([
    AutoBind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dragLeaveHandler", null);
//ProjectINput class
class ProjectInput extends BaseComponent {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.titleInputElement = this.element.querySelector('#title');
        this.descrptionInputElemen = this.element.querySelector('#description');
        this.peoleInputElement = this.element.querySelector('#people');
        this.configure();
        this.renderContent();
    }
    configure() {
        debugger;
        this.element.addEventListener('submit', this.submitHandler);
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
        debugger;
        const userInput = this.gethereUserInput();
        if (Array.isArray(userInput)) {
            //tupple is array acutaliy
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people); //
            this.clearInputs();
        }
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descrptionInputElemen.value = '';
        this.peoleInputElement.value = '';
    }
    renderContent() { }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
const input = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinished = new ProjectList('finished');
