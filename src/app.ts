// drag and drop interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;

}
interface DragTarget{
  dragOverHandler(event:DragEvent):void;
  dropHandler(event:DragEvent):void;
  dragLeaveHandler(event:DragEvent):void;

}

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
    isValid=isValid && data.value>=data.min;
  }
  if(data.max!=null && typeof data.value==='number'){
    isValid=isValid && data.value<=data.max;
  }
  return isValid;
  
}
type Listener <T>=(item:T[])=>void;
// project class

abstract class Componant<T extends HTMLElement,U extends HTMLElement>{
  templateElement:HTMLTemplateElement;
  hostElement:T;
  element:U;
  constructor(templateId:string,hostId:string,insertAtStart:boolean,newElementId?:string){
    this.templateElement=document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement=document.getElementById(hostId)! as T;
    const importedNode=document.importNode(this.templateElement.content,true);
    this.element=importedNode.firstElementChild as U;
    if(newElementId){
      this.element.id=newElementId;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtBeginning:boolean){
    this.hostElement.insertAdjacentElement(insertAtBeginning?'afterbegin':'beforeend',this.element);
  }
  abstract configure():void;
  abstract renderContent():void;
}




class State <T>{
  protected listeners:Listener<T>[]=[];
  addListener(listenerFn:Listener<T>){
    this.listeners.push(listenerFn);
  }
}




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
class ProjectState extends State<Project>{ 
 
  projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
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
  moveProject(projectId:string,newStatus:ProjectStatus){
    const project=this.projects.find(prj=>prj.id===projectId);
    if(project && project.status!==newStatus){
      project.status=newStatus;
      this.updateListeners();
    }

  }
  private updateListeners(){
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

}

const projectState = ProjectState.getInstance();

// input class
class InputElement extends Componant<HTMLDivElement,HTMLFormElement>{
 
  titileInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  pepoleInput: HTMLInputElement;
  constructor(){
    super('project-input','app',true,'user-input');
    this.titileInput=this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInput=this.element.querySelector('#description')! as HTMLInputElement;
    this.pepoleInput=this.element.querySelector('#people')! as HTMLInputElement;
    this.configure()
  
  }
  configure(){
    this.element.addEventListener('submit',this.submitHandler);
  }
  renderContent(): void {
    
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
  
}

// project item
class ProjectItem extends Componant<HTMLUListElement,HTMLLIElement> implements Draggable{
  private project:Project;
  get persons(){
    if(this.project.people===1){
      return '1 person';
    }else{
      return `${this.project.people} persons`;
    }
  }
  constructor(hostId:string,project:Project){
    super('single-project',hostId,false,project.id);
    this.project=project;
    this.configure();
    this.renderContent();
  }
  @Autobind
  DrageStartHandler(event:DragEvent){
    event.dataTransfer!.setData('text/plain',this.project.id);
    event.dataTransfer!.effectAllowed='move';
  }
  DragEndHandler(event:DragEvent){
    console.log('drag end',event);
  }


  configure(){
    this.element.addEventListener('dragstart',this.dragStartHandler);
    this.element.addEventListener('dragend',this.dragEndHandler);
  }
  renderContent(){
    this.element.querySelector('h2')!.textContent=this.project.title;
    this.element.querySelector('h3')!.textContent=this.persons+' assigned';
    this.element.querySelector('p')!.textContent=this.project.description;
  }
  @Autobind
  dragStartHandler(event:DragEvent){
    event.dataTransfer!.setData('text/plain',this.project.id);
    event.dataTransfer!.effectAllowed='move';
  }
  @Autobind
  dragEndHandler(_:DragEvent){
    console.log('drag end');
  }
}

// project list class
class ProjectList extends Componant<HTMLDivElement,HTMLElement> implements DragTarget{
  
  assignedProject: Project[];
  constructor(private type: 'active'|'finished'){
    super('project-list','app',false,`${type}-projects`);
    this.assignedProject=[];
    
    this.configure();
    this.renderContent();
   
  }
  @Autobind
  dragOverHandler(event: DragEvent): void {
    if(event.dataTransfer && event.dataTransfer.types[0]==='text/plain'){
      event.preventDefault();
      const listEl=this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }

  }
  @Autobind
  dropHandler(event: DragEvent): void {
    const prjId=event.dataTransfer!.getData('text/plain');
    projectState.moveProject(prjId,this.type==='active'?ProjectStatus.Active:ProjectStatus.Finished);
  }
  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    const listEl=this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  
  configure(): void {
    this.element.addEventListener('dragover',this.dragOverHandler);
    this.element.addEventListener('drop',this.dropHandler);
    this.element.addEventListener('dragleave',this.dragLeaveHandler);
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
  }
   renderContent(){
    const listId=`${this.type}-project-list`;
    this.element.querySelector('ul')!.id=listId;
    this.element.querySelector('h2')!.textContent=this.type.toUpperCase()+'PROJECTS';
  }
  private renderProject(){
    const listEl=document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    listEl.innerHTML='';
    for(const projectItem of this.assignedProject){
      new ProjectItem(this.element.querySelector('ul')!.id,projectItem);
     
    }
  }


}
const inputElement=new InputElement();
const activeProjectList=new ProjectList('active');
const finishedProjectList=new ProjectList('finished');

