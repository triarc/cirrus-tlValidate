declare var mod: ng.IModule;
interface IValidateScope extends angular.IScope {
    target: () => angular.IFormController;
    labelText: () => string;
    contextHelp: () => string;
    contextHelpAppendToBody: () => boolean;
    validationText: () => string;
    validateNow: boolean;
    explicit: () => boolean;
    showRequired: () => boolean;
    clearValidationErrors: boolean;
    labelTemplate: () => string;
    validateElement: () => void;
}
declare var INTEGER_REGEXP: RegExp;
