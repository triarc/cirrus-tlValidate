declare var mod: ng.IModule;
interface IValidateScope extends angular.IScope {
    target: () => angular.IFormController;
    labelText: () => string;
    contextHelp: () => string;
    contextHelpAppendToBody: () => boolean;
    contextHelpTemplate: () => string;
    validationText: () => string;
    validateNow: boolean;
    explicit: () => boolean;
    showRequired: () => boolean;
    clearValidationErrors: boolean;
    labelTemplate: () => string;
    validateElement: () => void;
    $toolTip: string;
}
declare var INTEGER_REGEXP: RegExp;
