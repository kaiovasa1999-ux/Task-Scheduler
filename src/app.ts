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
            minLength:3
        }
        const peopleInputValueValidatable: Validatable = {
            value: +peopleInputValue,
            required: true,
            min: 1,
            max: 3
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
            
        }
        
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',this.element);
    }

    private configure(){
        this.element.addEventListener('submit',this.submitHandler);
    }
}

const input = new ProjectInput();