namespace App{
    
    export class ProjectInput extends BaseComponent<HTMLDivElement,HTMLFormElement> {
     
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
}