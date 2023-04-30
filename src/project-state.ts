namespace DragDrop {
    class State<T> {
        protected listeners: Listener<T>[] = [];//is array from functions actualy
    
        addListener(listenerFn: Listener<T>){
            this.listeners.push(listenerFn);
        }
    }
    
    type Listener<T> = (items: T[]) => void;
    //project STate mangare
    
    export  class ProjectState extends State<Project>{
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
    export const projectState = ProjectState.getInstance();
}