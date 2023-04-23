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

    @AutoBind
    private submitHandler(event: Event){
        event.preventDefault();
        console.log(this.titleInputElement.value);
        
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',this.element);
    }

    private configure(){
        this.element.addEventListener('submit',this.submitHandler);
    }
}

const input = new ProjectInput();