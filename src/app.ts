// decrator auto bind

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}
interface validatable{
  value:string|number;
  required?:boolean;
  minLength?:number;
  maxLength?:number;
  min?:number;
  max?:number;

}
function Validate(data:validatable){
  let isValid=true;
  if(data.required){
    isValid=isValid && data.value.toString().trim().length!==0;
  }
  if(data.minLength!=null && typeof data.value==='string'){
    isValid=isValid && data.value.length>data.minLength;
  }
  if(data.maxLength!=null && typeof data.value==='string'){
    isValid=isValid && data.value.length<data.maxLength;
  }
  if(data.min!=null && typeof data.value==='number'){
    isValid=isValid && data.value>data.min;
  }
  if(data.max!=null && typeof data.value==='number'){
    isValid=isValid && data.value<data.max;
  }
  return isValid;
  
}
type Listener=(item:Project[])=>void;
// project class
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  
  
  ) {}
}

// Project State Management
class ProjectState { 
  private listeners: Listener[] = [];
  projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
   
    const newProject =new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
      ); 
      
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }



}

const projectState = ProjectState.getInstance();

// input class
class InputElement{
  templetElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titileInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  pepoleInput: HTMLInputElement;
  constructor(){
    this.templetElement=document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement=document.getElementById('app')! as HTMLDivElement;
    const importedNode=document.importNode(this.templetElement.content,true);
    this.element=importedNode.firstElementChild as HTMLFormElement;
    this.element.id='user-input';
    this.titileInput=this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInput=this.element.querySelector('#description')! as HTMLInputElement;
    this.pepoleInput=this.element.querySelector('#people')! as HTMLInputElement;
    this.configure()
    this.attach();
  }

  private attach(){
    this.hostElement.insertAdjacentElement('afterbegin',this.element);
  }
  private clearInput(){
    this.titileInput.value='';
    this.descriptionInput.value='';
    this.pepoleInput.value='';
  }


  @Autobind
  private submitHandler(event: Event){
    event.preventDefault();
    console.log(this.titileInput.value);
    if(!Validate({value:this.titileInput.value,required:true})||!Validate({value:this.descriptionInput.value,required:true,minLength:5})||!Validate({value:+this.pepoleInput.value,required:true,min:1,max:5})){
      alert('invalid input');
      return;
    }
    projectState.addProject(this.titileInput.value,this.descriptionInput.value,+this.pepoleInput.value);
    this.clearInput();
  }
  private configure(){
    this.element.addEventListener('submit',this.submitHandler);
  }
}

// project list class
class ProjectList{
  templetElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProject: Project[];
  constructor(private type: 'active'|'finished'){
    this.templetElement=document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement=document.getElementById('app')! as HTMLDivElement;
    const importedNode=document.importNode(this.templetElement.content,true);
    this.element=importedNode.firstElementChild as HTMLElement;
    this.element.id=`${this.type}-projects`;
    this.assignedProject=[];
    projectState.addListener((projects:Project[])=>{
      const relevantProject=projects.filter(project=>{
        if(this.type==='active'){
          return project.status===ProjectStatus.Active;
        }
        return project.status===ProjectStatus.Finished;
      })
      this.assignedProject=relevantProject;
      this.renderProject();
    })
    this.attach();
    this.renderContent();
   
  }

  private attach(){
    this.hostElement.insertAdjacentElement('beforeend',this.element);
  }
  private renderContent(){
    const listId=`${this.type}-project-list`;
    this.element.querySelector('ul')!.id=listId;
    this.element.querySelector('h2')!.textContent=this.type.toUpperCase()+'PROJECTS';
  }
  private renderProject(){
    console.log("reder runs")
    console.log("stated",projectState.projects);
    const listEl=document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    listEl.innerHTML='';
    for(const projectItem of this.assignedProject){
      const listItem=document.createElement('li');
      listItem.textContent=projectItem.title;
      listEl.appendChild(listItem);
    }
  }


}
const inputElement=new InputElement();
const activeProjectList=new ProjectList('active');
const finishedProjectList=new ProjectList('finished');

