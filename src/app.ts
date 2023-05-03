/// <reference path="Models/drag-drop.ts" />
/// <reference path="Enums/ProjectStatus.ts" />
/// <reference path="State/project-state.ts" />
/// <reference path="Util/validations.ts" />
/// <reference path="Decorators/Autobind.ts" />
/// <reference path="Components/BaseComponents.ts" />
/// <reference path="Components/ProjectInput.ts" />
/// <reference path="Components/ProjectItem.ts" />
/// <reference path="Components/ProjectList.ts" />
/// <reference path="Models/Project.ts" />

namespace App {
    new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished');
} 


