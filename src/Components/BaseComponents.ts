namespace App{
    
    export abstract class BaseComponent<T extends HTMLElement,U extends HTMLElement>{
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
}