class InputElement{
  templetElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  constructor(){
    this.templetElement=document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement=document.getElementById('app')! as HTMLDivElement;
    const importedNode=document.importNode(this.templetElement.content,true);
    this.element=importedNode.firstElementChild as HTMLFormElement;
    this.attach();
  }

  private attach(){
    this.hostElement.insertAdjacentElement('afterbegin',this.element);
  }
}
const inputElement=new InputElement();